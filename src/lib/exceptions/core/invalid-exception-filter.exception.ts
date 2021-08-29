import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";
import {INVALID_EXCEPTION_FILTER} from "@/lib/exceptions";


export class InvalidExceptionFilterException extends RuntimeException {
  constructor() {
    super(INVALID_EXCEPTION_FILTER);
  }
}
