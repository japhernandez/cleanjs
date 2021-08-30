import { ExceptionsHandler } from '../exceptions';
import { ExecutionContextHost } from '../helpers';

export type RouterProxyCallback = <TRequest, TResponse>(req?: TRequest, res?: TResponse, next?: () => void) => void;

export class RouterProxy {

  public createProxy(targetCallback: RouterProxyCallback, exceptionsHandler: ExceptionsHandler) {
    return <TRequest, TResponse>(req: TRequest, res: TResponse, next: () => void) => {
      try {
        targetCallback(req, res, next);
      } catch (e) {
        const host = new ExecutionContextHost([req, res, next]);
        exceptionsHandler.next(e, host);
      }
    };
  }

  public createExceptionLayerProxy(
    targetCallback: <TError, TRequest, TResponse>(err: TError, req: TRequest, res: TResponse, next: () => void) => void,
    exceptionsHandler: ExceptionsHandler,
  ) {
    return <TError, TRequest, TResponse>(err: TError, req: TRequest, res: TResponse, next: () => void) => {
      try {
        targetCallback(err, req, res, next);
      } catch (e) {
        const host = new ExecutionContextHost([req, res, next]);
        exceptionsHandler.next(e, host);
      }
    };
  }
}
