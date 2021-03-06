import { Injector, InstanceWrapper, Module } from '../ioc';
import { MiddlewareContainer } from './container';

export class MiddlewareResolver {
  private readonly instanceLoader = new Injector();

  constructor(private readonly middlewareContainer: MiddlewareContainer) {}

  public async resolveInstances(moduleRef: Module, moduleName: string) {
    const middleware = this.middlewareContainer.getMiddlewareCollection(
      moduleName,
    );
    const resolveInstance = async (wrapper: InstanceWrapper) =>
      this.resolveMiddlewareInstance(wrapper, middleware, moduleRef);
    await Promise.all([...middleware.values()].map(resolveInstance));
  }

  private async resolveMiddlewareInstance(
    wrapper: InstanceWrapper,
    middleware: Map<string, InstanceWrapper>,
    moduleRef: Module,
  ) {
    await this.instanceLoader.loadMiddleware(wrapper, middleware, moduleRef);
  }
}
