import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";
import {INVALID_CLASS_MESSAGE} from "@/lib/exceptions";


export class InvalidClassException extends RuntimeException {
  constructor(value: any) {
    super(INVALID_CLASS_MESSAGE`${value}`);
  }
}
