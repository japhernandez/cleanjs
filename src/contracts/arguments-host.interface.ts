export type ContextType = 'http' | 'ws' | 'rpc';

/**
 * Methods to obtain request and response objects.
 *
 * @publicApi
 */
export interface HttpArgumentsHost {
  /**
   * Returns the in-flight `request` object.
   */
  getRequest<T = any>(): T;
  /**
   * Returns the in-flight `response` object.
   */
  getResponse<T = any>(): T;
  getNext<T = any>(): T;
}

/**
 * Provides methods for retrieving the arguments being passed to a handler.
 * Allows choosing the appropriate execution context (e.g., Http, RPC, or
 * WebSockets) to retrieve the arguments from.
 *
 * @publicApi
 */
export interface ArgumentsHost {
  /**
   * Returns the array of arguments being passed to the handler.
   */
  getArgs<T extends Array<any> = any[]>(): T;
  /**
   * Returns a particular argument by index.
   * @param index index of argument to retrieve
   */
  getArgByIndex<T = any>(index: number): T;

  /**
   * Switch context to HTTP.
   * @returns interface with methods to retrieve HTTP arguments
   */
  switchToHttp(): HttpArgumentsHost;

  /**
   * Returns the current execution context type (string)
   */
  getType<TContext extends string = ContextType>(): TContext;
}