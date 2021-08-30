import {Abstract, DynamicModule, INestApplicationContext, Scope, Type} from "../contracts";
import {ContextId, Injector, InstanceLinksHost, Module, ModuleCompiler, NestContainer} from "../ioc";
import {InvalidClassScopeException, UnknownElementException, UnknownModuleException} from "../exceptions";
import {createContextId} from "../helpers";
import {Logger, LoggerService, LogLevel} from "../services";

export class NestApplicationContext implements INestApplicationContext {
  protected isInitialized = false;
  protected readonly injector = new Injector();

  private readonly activeShutdownSignals = new Array<string>();
  private readonly moduleCompiler = new ModuleCompiler();
  private shutdownCleanupRef?: (...args: unknown[]) => unknown;
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
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options: { strict: boolean } = { strict: false },
  ): TResult {

    return !(options && options.strict)
      ? this.find<TInput, TResult>(typeOrToken)
      : this.find<TInput, TResult>(typeOrToken, this.contextModule);
  }

  public resolve<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
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

  /**
   * Initalizes the Nest application.
   * Calls the Nest lifecycle events.
   *
   * @returns {Promise<this>} The NestApplicationContext instance as Promise
   */
  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    this.isInitialized = true;
    return this;
  }

  public async close(): Promise<void> {
    await this.dispose();
    // this.unsubscribeFromProcessSignals();
  }

  public useLogger(logger: LoggerService | LogLevel[] | false) {
    Logger.overrideLogger(logger);
  }

  // /**
  //  * Enables the usage of shutdown hooks. Will call the
  //  * `onApplicationShutdown` function of a provider if the
  //  * process receives a shutdown signal.
  //  *
  //  * @param {ShutdownSignal[]} [signals=[]] The system signals it should listen to
  //  *
  //  * @returns {this} The Nest application context instance
  //  */
  // public enableShutdownHooks(signals: (ShutdownSignal | string)[] = []): this {
  //   if (isEmpty(signals)) {
  //     signals = Object.keys(ShutdownSignal).map(
  //       (key: string) => ShutdownSignal[key],
  //     );
  //   } else {
  //     // given signals array should be unique because
  //     // process shouldn't listen to the same signal more than once.
  //     signals = Array.from(new Set(signals));
  //   }
  //
  //   signals = iterate(signals)
  //     .map((signal: string) => signal.toString().toUpperCase().trim())
  //     // filter out the signals which is already listening to
  //     .filter(signal => !this.activeShutdownSignals.includes(signal))
  //     .toArray();
  //
  //   this.listenToShutdownSignals(signals);
  //   return this;
  // }

  protected async dispose(): Promise<void> {
    // Nest application context has no server
    // to dispose, therefore just call a noop
    return Promise.resolve();
  }

  // /**
  //  * Listens to shutdown signals by listening to
  //  * process events
  //  *
  //  * @param {string[]} signals The system signals it should listen to
  //  */
  // protected listenToShutdownSignals(signals: string[]) {
  //   const cleanup = async (signal: string) => {
  //     try {
  //       signals.forEach(sig => process.removeListener(sig, cleanup));
  //       await this.dispose();
  //       process.kill(process.pid, signal);
  //     } catch (err) {
  //       Logger.error(
  //         MESSAGES.ERROR_DURING_SHUTDOWN,
  //         (err as Error)?.stack,
  //         NestApplicationContext.name,
  //       );
  //       process.exit(1);
  //     }
  //   };
  //   this.shutdownCleanupRef = cleanup as (...args: unknown[]) => unknown;
  //
  //   signals.forEach((signal: string) => {
  //     this.activeShutdownSignals.push(signal);
  //     process.on(signal as any, cleanup);
  //   });
  // }

  // /**
  //  * Unsubscribes from shutdown signals (process events)
  //  */
  // protected unsubscribeFromProcessSignals() {
  //   if (!this.shutdownCleanupRef) {
  //     return;
  //   }
  //   this.activeShutdownSignals.forEach(signal => {
  //     process.removeListener(signal, this.shutdownCleanupRef);
  //   });
  // }

  protected find<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule?: Module,
  ): TResult {
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
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
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