import {UNKNOWN_REQUEST_MAPPING} from "@/lib/exceptions";
import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";

export class UnknownRequestMappingException extends RuntimeException {
  constructor() {
    super(UNKNOWN_REQUEST_MAPPING);
  }
}
