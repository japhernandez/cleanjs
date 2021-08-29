import { CONTROLLER_ID_KEY } from '../ioc/constants';
import { ContextId } from '../ioc/instance-wrapper';
import { ParamProperties } from './context-utils';
import {Controller, Type} from "../contracts";

export const HANDLER_METADATA_SYMBOL = Symbol.for('handler_metadata:cache');

export type HandleResponseFn = HandlerResponseBasicFn

export type HandlerResponseBasicFn = <TResult, TResponse>(
  result: TResult,
  res: TResponse,
  req?: any,
) => any;

export interface HandlerMetadata {
  argsLength: number;
  paramtypes: any[];
  httpStatusCode: number;
  responseHeaders: any[];
  hasCustomHeaders: boolean;
  getParamsMetadata: (
    moduleKey: string,
    contextId?: ContextId,
    inquirerId?: string,
  ) => (ParamProperties & { metatype?: any })[];
  fnHandleResponse: HandleResponseFn;
}

export class HandlerMetadataStorage<
  TValue = HandlerMetadata,
  TKey extends Type<unknown> = any
> {
  private readonly [HANDLER_METADATA_SYMBOL] = new Map<string, TValue>();

  set(controller: TKey, methodName: string, metadata: TValue) {
    const metadataKey = this.getMetadataKey(controller, methodName);
    this[HANDLER_METADATA_SYMBOL].set(metadataKey, metadata);
  }

  get(controller: TKey, methodName: string): TValue | undefined {
    const metadataKey = this.getMetadataKey(controller, methodName);
    return this[HANDLER_METADATA_SYMBOL].get(metadataKey);
  }

  private getMetadataKey(controller: Controller, methodName: string): string {
    const ctor = controller.constructor;
    const controllerKey = ctor && (ctor[CONTROLLER_ID_KEY] || ctor.name);
    return controllerKey + ' ' + methodName;
  }
}
