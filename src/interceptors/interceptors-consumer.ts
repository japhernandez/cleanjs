import { mergeAll, switchMap } from 'rxjs/operators';
import { defer, from as fromPromise, Observable } from 'rxjs';

import { isEmpty } from '../utils';
import { ExecutionContextHost } from '../helpers';
import {CallHandler, ContextType, Controller, NestInterceptor, Type} from '../contracts';

export class InterceptorsConsumer {

  public async intercept<TContext extends string = ContextType>(
    interceptors: NestInterceptor[],
    args: unknown[],
    instance: Controller,
    callback: () => unknown,
    next: () => Promise<unknown>,
    type?: TContext,
  ): Promise<unknown> {
    if (isEmpty(interceptors)) {
      return next();
    }
    const context = this.createContext(args, instance, callback);
    context.setType<TContext>(type);

    const start$ = defer(() => this.transformDeffered(next));
    const nextFn = (i = 0) => async () => {
      if (i >= interceptors.length) {
        return start$;
      }
      const handler: CallHandler = {
        handle: () => fromPromise(nextFn(i + 1)()).pipe(mergeAll()),
      };
      return interceptors[i].intercept(context, handler);
    };
    return nextFn()();
  }

  public createContext(
    args: unknown[],
    instance: Controller,
    callback: () => unknown,
  ): ExecutionContextHost {
    return new ExecutionContextHost(
      args,
      instance.constructor as Type<unknown>,
      callback,
    );
  }

  public transformDeffered(next: () => Promise<any>): Observable<any> {
    return fromPromise(next()).pipe(
      switchMap(res => {
        const isDeffered = res instanceof Promise || res instanceof Observable;
        return isDeffered ? res : Promise.resolve(res);
      }),
    );
  }
}
