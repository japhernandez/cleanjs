import { ContextId } from '../ioc';
import {ParamProperties} from "../routers";

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
