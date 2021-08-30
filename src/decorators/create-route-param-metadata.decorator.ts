import { v4 as uuid } from 'uuid';
import {PipeTransform, Type, CustomParamFactory} from '../contracts';
import { ROUTE_ARGS_METADATA, assignCustomParameterMetadata, isFunction, isNil } from '../utils';

export type ParamDecoratorEnhancer = ParameterDecorator;

export function createParamDecorator<
  FactoryData = any,
  FactoryInput = any,
  FactoryOutput = any
>(
  factory: CustomParamFactory<FactoryData, FactoryInput, FactoryOutput>,
  enhancers: ParamDecoratorEnhancer[] = [],
): (
  ...dataOrPipes: (Type<PipeTransform> | PipeTransform | FactoryData)[]
) => ParameterDecorator {
  const paramtype = uuid();
  return (
    data?,
    ...pipes: (Type<PipeTransform> | PipeTransform | FactoryData)[]
  ): ParameterDecorator => (target, key, index) => {
    const args =
      Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) || {};

    const isPipe = (pipe: any) =>
      pipe &&
      ((isFunction(pipe) &&
        pipe.prototype &&
        isFunction(pipe.prototype.transform)) ||
        isFunction(pipe.transform));

    const hasParamData = isNil(data) || !isPipe(data);
    const paramData = hasParamData ? (data as any) : undefined;
    const paramPipes = hasParamData ? pipes : [data, ...pipes];

    Reflect.defineMetadata(
      ROUTE_ARGS_METADATA,
      assignCustomParameterMetadata(
        args,
        paramtype,
        index,
        factory,
        paramData,
        ...(paramPipes as PipeTransform[]),
      ),
      target.constructor,
      key,
    );
    enhancers.forEach(fn => fn(target, key, index));
  };
}
