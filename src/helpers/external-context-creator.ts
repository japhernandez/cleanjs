import {ExternalExceptionFilterContext} from '../exceptions';
import {STATIC_CONTEXT, NestContainer, ContextId, Module, ModulesContainer} from '../ioc';
import {InterceptorsConsumer, InterceptorsContextCreator} from '../interceptors';
import {PipesConsumer, PipesContextCreator} from '../pipes';
import {ContextUtils, ParamPropertiesContext} from './context-utils';
import {ExternalErrorProxy} from './external-proxy';
import {HandlerMetadataStorage} from './handler-metadata-storage';
import {CUSTOM_ROUTE_AGRS_METADATA, isEmpty, isFunction} from '../utils';
import {ContextType, Controller, PipeTransform, ExternalHandlerMetadata, ParamsMetadata} from '../contracts';
import {ParamData} from "../decorators";

export interface ParamsFactory {
  exchangeKeyForValue(type: number, data: ParamData, args: any): any;
}

export interface ExternalContextOptions {
  guards?: boolean;
  interceptors?: boolean;
  filters?: boolean;
}

export class ExternalContextCreator {
  private readonly contextUtils = new ContextUtils();
  private readonly externalErrorProxy = new ExternalErrorProxy();
  private readonly handlerMetadataStorage = new HandlerMetadataStorage<ExternalHandlerMetadata>();
  private container: NestContainer;

  constructor(
    private readonly interceptorsContextCreator: InterceptorsContextCreator,
    private readonly interceptorsConsumer: InterceptorsConsumer,
    private readonly modulesContainer: ModulesContainer,
    private readonly pipesContextCreator: PipesContextCreator,
    private readonly pipesConsumer: PipesConsumer,
    private readonly filtersContextCreator: ExternalExceptionFilterContext,
  ) {}

  static fromContainer(container: NestContainer): ExternalContextCreator {
    const interceptorsContextCreator = new InterceptorsContextCreator(
      container,
      container.applicationConfig,
    );
    const interceptorsConsumer = new InterceptorsConsumer();
    const pipesContextCreator = new PipesContextCreator(
      container,
      container.applicationConfig,
    );
    const pipesConsumer = new PipesConsumer();
    const filtersContextCreator = new ExternalExceptionFilterContext(
      container,
      container.applicationConfig,
    );

    const externalContextCreator = new ExternalContextCreator(
      interceptorsContextCreator,
      interceptorsConsumer,
      container.getModules(),
      pipesContextCreator,
      pipesConsumer,
      filtersContextCreator,
    );
    externalContextCreator.container = container;
    return externalContextCreator;
  }

  public create<
    TParamsMetadata extends ParamsMetadata = ParamsMetadata,
    TContext extends string = ContextType
  >(
    instance: Controller,
    callback: (...args: unknown[]) => unknown,
    methodName: string,
    metadataKey?: string,
    paramsFactory?: ParamsFactory,
    contextId = STATIC_CONTEXT,
    inquirerId?: string,
    options: ExternalContextOptions = {
      interceptors: true,
      guards: true,
      filters: true,
    },
    contextType: TContext = 'http' as TContext,
  ) {
    const module = this.getContextModuleName(instance.constructor);
    const { argsLength, paramtypes, getParamsMetadata } = this.getMetadata<
        TParamsMetadata, TContext
    >(instance, methodName, metadataKey, paramsFactory, contextType);

    const pipes = this.pipesContextCreator.create(
      instance,
      callback,
      module,
      contextId,
      inquirerId,
    );

    const exceptionFilter = this.filtersContextCreator.create(
      instance,
      callback,
      module,
      contextId,
      inquirerId,
    );
    const interceptors = options.interceptors
      ? this.interceptorsContextCreator.create(
          instance,
          callback,
          module,
          contextId,
          inquirerId,
        )
      : [];

    const paramsMetadata = getParamsMetadata(module, contextId, inquirerId);
    const paramsOptions = paramsMetadata
      ? this.contextUtils.mergeParamsMetatypes(paramsMetadata, paramtypes)
      : [];

    const fnApplyPipes = this.createPipesFn(pipes, paramsOptions);
    const handler = (initialArgs: unknown[], ...args: unknown[]) => async () => {
      if (fnApplyPipes) {
        await fnApplyPipes(initialArgs, ...args);
        return callback.apply(instance, initialArgs);
      }
      return callback.apply(instance, args);
    };

    const target = async (...args: any[]) => {
      const initialArgs = this.contextUtils.createNullArray(argsLength);

      const result = await this.interceptorsConsumer.intercept(
        interceptors,
        args,
        instance,
        callback,
        handler(initialArgs, ...args),
        contextType,
      );
      return this.transformToResult(result);
    };
    return options.filters
      ? this.externalErrorProxy.createProxy(
          target,
          exceptionFilter,
          contextType,
        )
      : target;
  }

  public getMetadata<TMetadata, TContext extends string = ContextType>(
    instance: Controller,
    methodName: string,
    metadataKey?: string,
    paramsFactory?: ParamsFactory,
    contextType?: TContext,
  ): ExternalHandlerMetadata {
    const cacheMetadata = this.handlerMetadataStorage.get(instance, methodName);
    if (cacheMetadata) {
      return cacheMetadata;
    }
    const metadata =
      this.contextUtils.reflectCallbackMetadata<TMetadata>(
        instance,
        methodName,
        metadataKey || '',
      ) || {};
    const keys = Object.keys(metadata);
    const argsLength = this.contextUtils.getArgumentsLength(keys, metadata);
    const paramtypes = this.contextUtils.reflectCallbackParamtypes(
      instance,
      methodName,
    );
    const contextFactory = this.contextUtils.getContextFactory<TContext>(
      contextType,
      instance,
      instance[methodName],
    );
    const getParamsMetadata = (
      moduleKey: string,
      contextId = STATIC_CONTEXT,
      inquirerId?: string,
    ) =>
      paramsFactory
        ? this.exchangeKeysForValues(
            keys,
            metadata,
            moduleKey,
            paramsFactory,
            contextId,
            inquirerId,
            contextFactory,
          )
        : null;

    const handlerMetadata: ExternalHandlerMetadata = {
      argsLength,
      paramtypes,
      getParamsMetadata,
    };
    this.handlerMetadataStorage.set(instance, methodName, handlerMetadata);
    return handlerMetadata;
  }

  public getContextModuleName(constructor: Function): string {
    const defaultModuleName = '';
    const className = constructor.name;
    if (!className) {
      return defaultModuleName;
    }

    for (const [key, module] of [...this.modulesContainer.entries()]) {
      if (this.getProviderByClassName(module, className)) {
        return key;
      }
    }
    return defaultModuleName;
  }

  public getProviderByClassName(module: Module, className: string): boolean {
    const { providers } = module;

    return [...providers.keys()].some(
        provider => provider === className,
    );
  }

  public exchangeKeysForValues<TMetadata = any>(
    keys: string[],
    metadata: TMetadata,
    moduleContext: string,
    paramsFactory: ParamsFactory,
    contextId = STATIC_CONTEXT,
    inquirerId?: string,
    contextFactory = this.contextUtils.getContextFactory('http'),
  ): ParamPropertiesContext[] {
    this.pipesContextCreator.setModuleContext(moduleContext);

    return keys.map(key => {
      const { index, data, pipes: pipesCollection } = metadata[key];
      const pipes = this.pipesContextCreator.createConcreteContext(
        pipesCollection,
        contextId,
        inquirerId,
      );
      const type = this.contextUtils.mapParamType(key);

      if (key.includes(CUSTOM_ROUTE_AGRS_METADATA)) {
        const { factory } = metadata[key];
        const customExtractValue = this.contextUtils.getCustomFactory(
          factory,
          data,
          contextFactory,
        );
        return { index, extractValue: customExtractValue, type, data, pipes };
      }
      const numericType = Number(type);
      const extractValue = (...args: unknown[]) =>
        paramsFactory.exchangeKeyForValue(numericType, data, args);

      return { index, extractValue, type: numericType, data, pipes };
    });
  }

  public createPipesFn(
    pipes: PipeTransform[],
    paramsOptions: (ParamPropertiesContext & { metatype?: unknown })[],
  ) {
    const pipesFn = async (args: unknown[], ...params: unknown[]) => {
      const resolveParamValue = async (
        param: ParamPropertiesContext & { metatype?: unknown },
      ) => {
        const {
          index,
          extractValue,
          type,
          data,
          metatype,
          pipes: paramPipes,
        } = param;
        const value = extractValue(...params);

        args[index] = await this.getParamValue(
          value,
          { metatype, type, data },
          pipes.concat(paramPipes),
        );
      };
      await Promise.all(paramsOptions.map(resolveParamValue));
    };
    return paramsOptions.length ? pipesFn : null;
  }

  public async getParamValue<T>(
    value: T,
    { metatype, type, data }: { metatype: any; type: any; data: any },
    pipes: PipeTransform[],
  ): Promise<any> {
    return isEmpty(pipes)
      ? value
      : this.pipesConsumer.apply(value, { metatype, type, data }, pipes);
  }

  public async transformToResult(resultOrDeffered: any) {
    if (resultOrDeffered && isFunction(resultOrDeffered.subscribe)) {
      return resultOrDeffered.toPromise();
    }
    return resultOrDeffered;
  }

  public registerRequestProvider<T = any>(request: T, contextId: ContextId) {
    this.container.registerRequestProvider<T>(request, contextId);
  }
}
