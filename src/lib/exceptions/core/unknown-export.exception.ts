import {UNKNOWN_EXPORT_MESSAGE} from "@/lib/exceptions";
import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";

export class UnknownExportException extends RuntimeException {
  constructor(token: string | symbol, moduleName: string) {
    super(UNKNOWN_EXPORT_MESSAGE(token, moduleName));
  }
}
