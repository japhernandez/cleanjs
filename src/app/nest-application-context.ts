import {Abstract, DynamicModule, INestApplicationContext, Scope, Type} from "../contracts";
import {ContextId, Injector, InstanceLinksHost, Module, ModuleCompiler, NestContainer} from "../ioc";
import {InvalidClassScopeException, UnknownElementException, UnknownModuleException} from "../exceptions";
import {createContextId} from "../helpers";
import {Logger, LoggerService, LogLevel} from "../services";

type GetType = Type<any> | Abstract<any> | string | symbol

export class NestApplicationContext implements INestApplicationContext {
  protected isInitialized = false;
  protected readonly injector = new Injector();

  private readonly moduleCompiler = new ModuleCompiler();
  private _instanceLinksHost: InstanceLinksHost;

  private get instanceLinksHost() {
    if (!this._instanceLinksHost) {
      this._instanceLinksHost = new InstanceLinksHost(this.container);
    }
    return this._instanceLinksHost;
  }

  constructor(
    protected readonly container: NestContainer,
    private readonly scope = new Array<Type<any>>(),
    private contextModule: Module = null,
  ) {}

  public selectContextModule() {
    const modules = this.container.getModules().values();
    this.contextModule = modules.next().value;
  }

  public select<T>(
    moduleType: Type<T> | DynamicModule,
  ): INestApplicationContext {
    const modulesContainer = this.container.getModules();
    const contextModuleCtor = this.contextModule.metatype;
    const scope = this.scope.concat(contextModuleCtor);

    const moduleTokenFactory = this.container.getModuleTokenFactory();
    const { type, dynamicMetadata } = this.moduleCompiler.extractMetadata(
      moduleType,
    );
    const token = moduleTokenFactory.create(type, dynamicMetadata);

    const selectedModule = modulesContainer.get(token);
    if (!selectedModule) {
      throw new UnknownModuleException();
    }
    return new NestApplicationContext(this.container, scope, selectedModule);
  }


  public get<TInput = any, TResult = TInput>(
    typeOrToken: GetType, options: { strict: boolean } = { strict: false }
  ): TResult {
    return !(options && options.strict)
      ? this.find<TInput, TResult>(typeOrToken)
      : this.find<TInput, TResult>(typeOrToken, this.contextModule);
  }

  public resolve<TInput = any, TResult = TInput>(
    typeOrToken: GetType,
    contextId = createContextId(),
    options: { strict: boolean } = { strict: false },
  ): Promise<TResult> {
    return this.resolvePerContext(
      typeOrToken,
      this.contextModule,
      contextId,
      options,
    );
  }

  public registerRequestByContextId<T = any>(request: T, contextId: ContextId) {
    this.container.registerRequestProvider(request, contextId);
  }

  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    this.isInitialized = true;
    return this;
  }

  public async close(): Promise<void> {
    await this.dispose();
  }

  public useLogger(logger: LoggerService | LogLevel[] | false) {
    Logger.overrideLogger(logger);
  }

  protected async dispose(): Promise<void> {
    return Promise.resolve();
  }

  protected find<TInput = any, TResult = TInput>(typeOrToken: GetType, contextModule?: Module): TResult {
    const moduleId = contextModule && contextModule.id;
    const { wrapperRef } = this.instanceLinksHost.get<TResult>(
      typeOrToken,
      moduleId,
    );
    if (
      wrapperRef.scope === Scope.REQUEST ||
      wrapperRef.scope === Scope.TRANSIENT
    ) {
      throw new InvalidClassScopeException(typeOrToken);
    }
    return wrapperRef.instance;
  }

  protected async resolvePerContext<TInput = any, TResult = TInput>(
    typeOrToken:  GetType,
    contextModule: Module,
    contextId: ContextId,
    options?: { strict: boolean },
  ): Promise<TResult> {
    const isStrictModeEnabled = options && options.strict;
    const instanceLink = isStrictModeEnabled
      ? this.instanceLinksHost.get(typeOrToken, contextModule.id)
      : this.instanceLinksHost.get(typeOrToken);

    const { wrapperRef, collection } = instanceLink;
    if (wrapperRef.isDependencyTreeStatic() && !wrapperRef.isTransient) {
      return this.get(typeOrToken);
    }

    const ctorHost = wrapperRef.instance || { constructor: typeOrToken };
    const instance = await this.injector.loadPerContext(
      ctorHost,
      wrapperRef.host,
      collection,
      contextId,
    );
    if (!instance) {
      throw new UnknownElementException();
    }
    return instance;
  }
}
