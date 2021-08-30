import {RuntimeException} from "./runtime.exception";
import {Type} from "../contracts";
import {UNDEFINED_FORWARDREF_MESSAGE} from "./messages";

export class UndefinedForwardRefException extends RuntimeException {
  constructor(scope: Type<any>[]) {
    super(UNDEFINED_FORWARDREF_MESSAGE(scope));
  }
}
