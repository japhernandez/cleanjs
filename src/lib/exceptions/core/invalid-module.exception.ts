import {INVALID_MODULE_MESSAGE} from "@/lib/exceptions";
import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";


export class InvalidModuleException extends RuntimeException {
  constructor(parentModule: any, index: number, scope: any[]) {
    super(INVALID_MODULE_MESSAGE(parentModule, index, scope));
  }
}
