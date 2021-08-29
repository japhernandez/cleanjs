import { ContextId } from '../ioc';
import { ParamProperties } from '../helpers/context-utils';

type ParamPropertiesWithMetatype<T = any> = ParamProperties & { metatype?: T };
export interface ExternalHandlerMetadata {
  argsLength: number;
  paramtypes: any[];
  getParamsMetadata: (
    moduleKey: string,
    contextId?: ContextId,
    inquirerId?: string,
  ) => ParamPropertiesWithMetatype[];
}
