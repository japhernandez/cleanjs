import {INVALID_MIDDLEWARE_MESSAGE} from "@/lib/exceptions";
import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";


export class InvalidMiddlewareException extends RuntimeException {
  constructor(name: string) {
    super(INVALID_MIDDLEWARE_MESSAGE`${name}`);
  }
}
