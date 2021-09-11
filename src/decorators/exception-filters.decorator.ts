import {IExceptionFilter} from "../contracts";
import { EXCEPTION_FILTERS_METADATA, extendArrayMetadata, isFunction, validateEach } from '../utils';

export const UseFilters = (...filters: (IExceptionFilter | Function)[]) => addExceptionFiltersMetadata(...filters);

function addExceptionFiltersMetadata(...filters: (Function | IExceptionFilter)[]): MethodDecorator & ClassDecorator {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    const isFilterValid = <T extends Function | Record<string, any>>(filter: T) =>
      filter && (isFunction(filter) || isFunction((filter as Record<string, any>).catch));

    if (descriptor) {
      validateEach(
        target.constructor,
        filters,
        isFilterValid,
        '@UseFilters',
        'filter',
      );
      extendArrayMetadata(
        EXCEPTION_FILTERS_METADATA,
        filters,
        descriptor.value,
      );
      return descriptor;
    }
    validateEach(target, filters, isFilterValid, '@UseFilters', 'filter');
    extendArrayMetadata(EXCEPTION_FILTERS_METADATA, filters, target);
    return target;
  };
}
