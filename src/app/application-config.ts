import {ExceptionFilter, NestInterceptor, PipeTransform} from "../contracts";
import {InstanceWrapper} from "../ioc";

export class ApplicationConfig {
  private globalPrefix = '';
  private globalPipes: PipeTransform[] = [];
  private globalFilters : ExceptionFilter[] = [];
  private globalInterceptors: NestInterceptor[] = [];
  private readonly globalRequestPipes: InstanceWrapper<PipeTransform>[] = [];
  private readonly globalRequestFilters: InstanceWrapper<ExceptionFilter>[] = [];
  private readonly globalRequestInterceptors: InstanceWrapper<NestInterceptor>[] = [];

  public setGlobalPrefix(prefix: string) {
    this.globalPrefix = prefix;
  }

  public getGlobalPrefix() {
    return this.globalPrefix;
  }

  public addGlobalPipe(pipe: PipeTransform<any>) {
    this.globalPipes.push(pipe);
  }

  public useGlobalPipes(...pipes: PipeTransform<any>[]) {
    this.globalPipes = this.globalPipes.concat(pipes);
  }

  public getGlobalFilters(): ExceptionFilter[] {
    return this.globalFilters;
  }

  public addGlobalFilter(filter: ExceptionFilter) {
    this.globalFilters.push(filter);
  }

  public useGlobalFilters(...filters: ExceptionFilter[]) {
    this.globalFilters = this.globalFilters.concat(filters);
  }

  public getGlobalPipes(): PipeTransform<any>[] {
    return this.globalPipes;
  }

  public getGlobalInterceptors(): NestInterceptor[] {
    return this.globalInterceptors;
  }

  public addGlobalInterceptor(interceptor: NestInterceptor) {
    this.globalInterceptors.push(interceptor);
  }

  public useGlobalInterceptors(...interceptors: NestInterceptor[]) {
    this.globalInterceptors = this.globalInterceptors.concat(interceptors);
  }

  public addGlobalRequestInterceptor(
    wrapper: InstanceWrapper<NestInterceptor>,
  ) {
    this.globalRequestInterceptors.push(wrapper);
  }

  public getGlobalRequestInterceptors(): InstanceWrapper<NestInterceptor>[] {
    return this.globalRequestInterceptors;
  }

  public addGlobalRequestPipe(wrapper: InstanceWrapper<PipeTransform>) {
    this.globalRequestPipes.push(wrapper);
  }

  public getGlobalRequestPipes(): InstanceWrapper<PipeTransform>[] {
    return this.globalRequestPipes;
  }

  public addGlobalRequestFilter(wrapper: InstanceWrapper<ExceptionFilter>) {
    this.globalRequestFilters.push(wrapper);
  }

  public getGlobalRequestFilters(): InstanceWrapper<ExceptionFilter>[] {
    return this.globalRequestFilters;
  }
}
