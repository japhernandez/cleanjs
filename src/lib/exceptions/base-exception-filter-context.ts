import { iterate } from 'iterare';
import { ContextCreator } from '../helpers/context-creator';
import { STATIC_CONTEXT } from '../ioc/constants';
import { NestContainer } from '../ioc/container';
import { InstanceWrapper } from '../ioc/instance-wrapper';
import { isEmpty, isFunction } from '../utils/shared.utils';
import { FILTER_CATCH_EXCEPTIONS } from '../utils/constants';
import {ExceptionFilter, Type} from "@/lib/contracts";

export class BaseExceptionFilterContext extends ContextCreator {
  protected moduleContext: string;

  constructor(private readonly container: NestContainer) {
    super();
  }

  public createConcreteContext<T extends any[], R extends any[]>(
    metadata: T,
    contextId = STATIC_CONTEXT,
    inquirerId?: string,
  ): R {
    if (isEmpty(metadata)) {
      return [] as R;
    }
    return iterate(metadata)
      .filter(
        instance => instance && (isFunction(instance.catch) || instance.name),
      )
      .map(filter => this.getFilterInstance(filter, contextId, inquirerId))
      .filter(item => !!item)
      .map(instance => ({
        func: instance.catch.bind(instance),
        exceptionMetatypes: this.reflectCatchExceptions(instance),
      }))
      .toArray() as R;
  }

  public getFilterInstance(
    filter: Function | ExceptionFilter,
    contextId = STATIC_CONTEXT,
    inquirerId?: string,
  ): ExceptionFilter | null {
    const isObject = (filter as ExceptionFilter).catch;
    if (isObject) {
      return filter as ExceptionFilter;
    }
    const instanceWrapper = this.getInstanceByMetatype(filter);
    if (!instanceWrapper) {
      return null;
    }
    const instanceHost = instanceWrapper.getInstanceByContextId(
      contextId,
      inquirerId,
    );
    return instanceHost && instanceHost.instance;
  }

  public getInstanceByMetatype<T extends Record<string, any>>(
    filter: T,
  ): InstanceWrapper | undefined {
    if (!this.moduleContext) {
      return;
    }
    const collection = this.container.getModules();
    const moduleRef = collection.get(this.moduleContext);
    if (!moduleRef) {
      return;
    }
    return moduleRef.injectables.get(filter.name);
  }

  public reflectCatchExceptions(instance: ExceptionFilter): Type<any>[] {
    const prototype = Object.getPrototypeOf(instance);
    return (
      Reflect.getMetadata(FILTER_CATCH_EXCEPTIONS, prototype.constructor) || []
    );
  }
}
