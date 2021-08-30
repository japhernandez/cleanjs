import {ExternalExceptionFilter} from './external-exception-filter';
import {isEmpty} from '../utils';
import {ArgumentsHost, ExceptionFilterMetadata, Type} from "../contracts";
import {InvalidExceptionFilterException} from "./invalid-exception-filter.exception";

export class ExternalExceptionsHandler extends ExternalExceptionFilter {
  private filters: ExceptionFilterMetadata[] = [];

  public next(exception: Error | any, host: ArgumentsHost): Promise<any> {
    const result = this.invokeCustomFilters(exception, host);
    if (result) {
      return result;
    }
    return super.catch(exception, host);
  }

  public setCustomFilters(filters: ExceptionFilterMetadata[]) {
    if (!Array.isArray(filters)) {
      throw new InvalidExceptionFilterException();
    }
    this.filters = filters;
  }

  public invokeCustomFilters<T = any>(
    exception: T,
    host: ArgumentsHost,
  ): Promise<any> | null {
    if (isEmpty(this.filters)) {
      return null;
    }
    const isInstanceOf = (metatype: Type<unknown>) => exception instanceof metatype;

    const filter = this.filters.find(({ exceptionMetatypes }) => {
      return !exceptionMetatypes.length || exceptionMetatypes.some(isInstanceOf);
    });

    return filter ? filter.func(exception, host) : null;
  }
}
