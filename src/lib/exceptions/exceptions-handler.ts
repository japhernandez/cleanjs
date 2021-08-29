import {isEmpty} from '../utils/shared.utils';
import {InvalidExceptionFilterException} from './core/invalid-exception-filter.exception';
import {BaseExceptionFilter} from './base-exception-filter';
import {ArgumentsHost, ExceptionFilterMetadata, Type} from "@/lib/contracts";
import {HttpException} from "@/lib/exceptions/http";

export class ExceptionsHandler extends BaseExceptionFilter {

  private filters: ExceptionFilterMetadata[] = [];

  public next(exception: Error | HttpException | any, ctx: ArgumentsHost) {
    if (this.invokeCustomFilters(exception, ctx)) {
      return;
    }
    super.catch(exception, ctx);
  }

  public setCustomFilters(filters: ExceptionFilterMetadata[]): void {
    if (!Array.isArray(filters)) {
      throw new InvalidExceptionFilterException();
    }
    this.filters = filters;
  }

  public invokeCustomFilters<T = any>(exception: T, ctx: ArgumentsHost): boolean {
    if (isEmpty(this.filters)) {
      return false;
    }
    const isInstanceOf = (metatype: Type<unknown>) =>
        exception instanceof metatype;

    const filter = this.filters.find(({ exceptionMetatypes }) => {
      return !exceptionMetatypes.length || exceptionMetatypes.some(isInstanceOf);
    });
    filter && filter.func(exception, ctx);
    return !!filter;
  }
}
