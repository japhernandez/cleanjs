import { SCOPE_OPTIONS_METADATA } from '../utils/constants';
import {Scope, Type} from "@/lib/contracts";


export function getClassScope(provider: Type<unknown>): Scope {
  const metadata = Reflect.getMetadata(SCOPE_OPTIONS_METADATA, provider);
  return metadata && metadata.scope;
}
