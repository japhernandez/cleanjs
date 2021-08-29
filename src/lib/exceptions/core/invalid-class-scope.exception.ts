import {Abstract, Type} from "@/lib/contracts";
import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";
import {isFunction} from "@/lib/utils";
import {INVALID_CLASS_SCOPE_MESSAGE} from "@/lib/exceptions";

export class InvalidClassScopeException extends RuntimeException {
  constructor(metatypeOrToken: Type<any> | Abstract<any> | string | symbol) {
    let name = isFunction(metatypeOrToken)
      ? (metatypeOrToken as Function).name
      : metatypeOrToken;
    name = name && name.toString();

    super(INVALID_CLASS_SCOPE_MESSAGE`${name}`);
  }
}
