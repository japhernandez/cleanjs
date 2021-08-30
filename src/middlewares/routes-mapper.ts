import { PATH_METADATA } from '../utils';
import {
  addLeadingSlash,
  isString,
  isUndefined,
} from '../utils';
import { NestContainer } from '../ioc';
import { MetadataScanner } from '../app';
import { RouterExplorer } from '../routers';
import {RouteInfo, Type} from "../contracts";
import {RequestMethod} from "../enums";

export class RoutesMapper {
  private readonly routerExplorer: RouterExplorer;

  constructor(container: NestContainer) {
    this.routerExplorer = new RouterExplorer(new MetadataScanner(), container);
  }

  public mapRouteToRouteInfo(
    route: Type<any> | RouteInfo | string,
  ): RouteInfo[] {
    if (isString(route)) {
      return [
        {
          path: this.validateRoutePath(route),
          method: RequestMethod.ALL,
        },
      ];
    }
    const routePathOrPaths: string | string[] = Reflect.getMetadata(
      PATH_METADATA,
      route,
    );
    if (this.isRouteInfo(routePathOrPaths, route)) {
      return [
        {
          path: this.validateRoutePath(route.path),
          method: route.method,
        },
      ];
    }
    const paths = this.routerExplorer.scanForPaths(
      Object.create(route),
      route.prototype,
    );
    const concatPaths = <T>(acc: T[], currentValue: T[]) =>
      acc.concat(currentValue);

    return []
      .concat(routePathOrPaths)
      .map(routePath =>
        paths
          .map(
            item =>
              item.path &&
              item.path.map(p => ({
                path:
                  this.validateGlobalPath(routePath) +
                  this.validateRoutePath(p),
                method: item.requestMethod,
              })),
          )
          .reduce(concatPaths, []),
      )
      .reduce(concatPaths, []);
  }

  private isRouteInfo(
    path: string | string[] | undefined,
    objectOrClass: Function | RouteInfo,
  ): objectOrClass is RouteInfo {
    return isUndefined(path);
  }

  private validateGlobalPath(path: string): string {
    const prefix = addLeadingSlash(path);
    return prefix === '/' ? '' : prefix;
  }

  private validateRoutePath(path: string): string {
    return addLeadingSlash(path);
  }
}
