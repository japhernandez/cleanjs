import { CUSTOM_ROUTE_AGRS_METADATA } from './constants';
import { ParamData, IRouteParamMetadata } from '../decorators';
import { IHandlerTransform, Type, CustomParamFactory } from '../contracts';

export function assignCustomParameterMetadata(
  args: Record<number, IRouteParamMetadata>, paramType: number | string, index: number,
  factory: CustomParamFactory, data?: ParamData, ...pipes: (Type<IHandlerTransform> | IHandlerTransform)[]
) {
  return {
    ...args,
    [`${paramType}${CUSTOM_ROUTE_AGRS_METADATA}:${index}`]: { index, factory, data, pipes }
  };
}
