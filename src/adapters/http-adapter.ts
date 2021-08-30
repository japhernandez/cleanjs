import {CorsOptions, CorsOptionsDelegate, HttpServer, NestApplicationOptions, RequestHandler} from "../contracts";
import {RequestMethod} from "../enums";

export abstract class AbstractHttpAdapter<
  TServer = any,
  TRequest = any,
  TResponse = any
> implements HttpServer<TRequest, TResponse> {
  protected httpServer: TServer;

  protected constructor(protected readonly instance: any) {}

  all(path: string, handler: RequestHandler<TRequest, TResponse>);
  all(handler: RequestHandler<TRequest, TResponse>);
  all(path: any, handler?: any) {
    throw new Error('Method not implemented.');
  }
  setBaseViewsDir?(path: string | string[]): this {
    throw new Error('Method not implemented.');
  }

  public use(...args: any[]) {
    return this.instance.use(...args);
  }

  public get(handler: RequestHandler);
  public get(path: any, handler: RequestHandler);
  public get(...args: any[]) {
    return this.instance.get(...args);
  }

  public post(handler: RequestHandler);
  public post(path: any, handler: RequestHandler);
  public post(...args: any[]) {
    return this.instance.post(...args);
  }

  public head(handler: RequestHandler);
  public head(path: any, handler: RequestHandler);
  public head(...args: any[]) {
    return this.instance.head(...args);
  }

  public delete(handler: RequestHandler);
  public delete(path: any, handler: RequestHandler);
  public delete(...args: any[]) {
    return this.instance.delete(...args);
  }

  public put(handler: RequestHandler);
  public put(path: any, handler: RequestHandler);
  public put(...args: any[]) {
    return this.instance.put(...args);
  }

  public patch(handler: RequestHandler);
  public patch(path: any, handler: RequestHandler);
  public patch(...args: any[]) {
    return this.instance.patch(...args);
  }

  public options(handler: RequestHandler);
  public options(path: any, handler: RequestHandler);
  public options(...args: any[]) {
    return this.instance.options(...args);
  }

  public listen(port: string | number, callback?: () => void);
  public listen(port: string | number, hostname: string, callback?: () => void);
  public listen(port: any, hostname?: any, callback?: any) {
    return this.instance.listen(port, hostname, callback);
  }

  public getHttpServer(): TServer {
    return this.httpServer;
  }

  public setHttpServer(httpServer: TServer) {
    this.httpServer = httpServer;
  }

  public getInstance<T = any>(): T {
    return this.instance as T;
  }

  abstract init();
  abstract close();
  abstract initHttpServer(options: NestApplicationOptions);
  abstract setViewEngine(engine: string);
  abstract getRequestHostname(request);
  abstract getRequestMethod(request);
  abstract getRequestUrl(request);
  abstract status(response, statusCode: number);
  abstract reply(response, body: any, statusCode?: number);
  abstract render(response, view: string, options: any);
  abstract redirect(response, statusCode: number, url: string);
  abstract setErrorHandler(handler: Function, prefix?: string);
  abstract setNotFoundHandler(handler: Function, prefix?: string);
  abstract setHeader(response, name: string, value: string);
  abstract registerParserMiddleware(prefix?: string);
  abstract enableCors(
    options: CorsOptions | CorsOptionsDelegate<TRequest>,
    prefix?: string,
  );
  abstract createMiddlewareFactory(
    requestMethod: RequestMethod,
  ):
    | ((path: string, callback: Function) => any)
    | Promise<(path: string, callback: Function) => any>;
  abstract getType(): string;
}
