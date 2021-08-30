import { RoutesMapper } from './routes-mapper';
import { filterMiddleware } from './utils';
import { iterate } from 'iterare';
import {
  HttpServer,
  MiddlewareConfigProxy,
  MiddlewareConfiguration,
  MiddlewareConsumer,
  RouteInfo,
  Type
} from "../contracts";
import {flatten} from "../decorators";

export class MiddlewareBuilder implements MiddlewareConsumer {
  private readonly middlewareCollection = new Set<MiddlewareConfiguration>();

  constructor(
    private readonly routesMapper: RoutesMapper,
    private readonly httpAdapter: HttpServer,
  ) {}

  public apply(
    ...middleware: Array<Type<any> | Function | any>
  ): MiddlewareConfigProxy {
    return new MiddlewareBuilder.ConfigProxy(this, flatten(middleware));
  }

  public build(): MiddlewareConfiguration[] {
    return [...this.middlewareCollection];
  }

  public getHttpAdapter(): HttpServer {
    return this.httpAdapter;
  }

  private static readonly ConfigProxy = class implements MiddlewareConfigProxy {
    private excludedRoutes: RouteInfo[] = [];

    constructor(
      private readonly builder: MiddlewareBuilder,
      private readonly middleware: Array<Type<any> | Function | any>,
    ) {}

    public getExcludedRoutes(): RouteInfo[] {
      return this.excludedRoutes;
    }

    public exclude(
      ...routes: Array<string | RouteInfo>
    ): MiddlewareConfigProxy {
      this.excludedRoutes = this.getRoutesFlatList(routes);
      return this;
    }

    public forRoutes(
      ...routes: Array<string | Type<any> | RouteInfo>
    ): MiddlewareConsumer {
      const { middlewareCollection } = this.builder;

      const forRoutes = this.getRoutesFlatList(routes);
      const configuration = {
        middleware: filterMiddleware(
          this.middleware,
          this.excludedRoutes,
          this.builder.getHttpAdapter(),
        ),
        forRoutes,
      };
      middlewareCollection.add(configuration);
      return this.builder;
    }

    private getRoutesFlatList(
      routes: Array<string | Type<any> | RouteInfo>,
    ): RouteInfo[] {
      const { routesMapper } = this.builder;

      return iterate(routes)
        .map(route => routesMapper.mapRouteToRouteInfo(route))
        .flatten()
        .toArray();
    }
  };
}
