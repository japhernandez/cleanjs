import { CUSTOM_ROUTE_AGRS_METADATA } from './constants';
import {
  ParamData,
  RouteParamMetadata,
} from '../decorators/http/route-params.decorator';
import { PipeTransform, Type } from '../contracts';
import { CustomParamFactory } from '../contracts/custom-route-param-factory.interface';

export function assignCustomParameterMetadata(
  args: Record<number, RouteParamMetadata>,
  paramtype: number | string,
  index: number,
  factory: CustomParamFactory,
  data?: ParamData,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  return {
    ...args,
    [`${paramtype}${CUSTOM_ROUTE_AGRS_METADATA}:${index}`]: {
      index,
      factory,
      data,
      pipes,
    },
  };
}
