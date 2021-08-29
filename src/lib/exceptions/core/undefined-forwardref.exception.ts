import {Type} from "@/lib/contracts";
import {UNDEFINED_FORWARDREF_MESSAGE} from "@/lib/exceptions";
import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";

export class UndefinedForwardRefException extends RuntimeException {
  constructor(scope: Type<any>[]) {
    super(UNDEFINED_FORWARDREF_MESSAGE(scope));
  }
}
