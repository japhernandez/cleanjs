import { ApplicationConfig } from '../app/application-config';
import { STATIC_CONTEXT } from '../ioc/constants';
import { NestContainer } from '../ioc/container';
import { InstanceWrapper } from '../ioc/instance-wrapper';
import { RouterProxyCallback } from '../routers/router-proxy';
import { BaseExceptionFilterContext } from './base-exception-filter-context';
import { ExternalExceptionsHandler } from './external-exceptions-handler';
import { iterate } from 'iterare';
import {Controller, ExceptionFilterMetadata} from '../contracts';
import { EXCEPTION_FILTERS_METADATA } from '../utils/constants';
import { isEmpty } from '../utils/shared.utils';

export class ExternalExceptionFilterContext extends BaseExceptionFilterContext {
  constructor(
    container: NestContainer,
    private readonly config?: ApplicationConfig,
  ) {
    super(container);
  }

  public create(
    instance: Controller,
    callback: RouterProxyCallback,
    module: string,
    contextId = STATIC_CONTEXT,
    inquirerId?: string,
  ): ExternalExceptionsHandler {
    this.moduleContext = module;

    const exceptionHandler = new ExternalExceptionsHandler();
    const filters = this.createContext<ExceptionFilterMetadata[]>(
      instance,
      callback,
      EXCEPTION_FILTERS_METADATA,
      contextId,
      inquirerId,
    );
    if (isEmpty(filters)) {
      return exceptionHandler;
    }
    exceptionHandler.setCustomFilters(filters.reverse());
    return exceptionHandler;
  }

  public getGlobalMetadata<T extends any[]>(
    contextId = STATIC_CONTEXT,
    inquirerId?: string,
  ): T {
    if (!this.config) {
      return [] as T;
    }
    const globalFilters = this.config.getGlobalFilters() as T;
    if (contextId === STATIC_CONTEXT && !inquirerId) {
      return globalFilters;
    }
    const scopedFilterWrappers = this.config.getGlobalRequestFilters() as InstanceWrapper[];
    const scopedFilters = iterate(scopedFilterWrappers)
      .map(wrapper => wrapper.getInstanceByContextId(contextId, inquirerId))
      .filter(host => !!host)
      .map(host => host.instance)
      .toArray();

    return globalFilters.concat(scopedFilters) as T;
  }
}
