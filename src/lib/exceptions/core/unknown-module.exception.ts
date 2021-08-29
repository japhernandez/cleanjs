import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";

export class UnknownModuleException extends RuntimeException {
  constructor() {
    super(
      'Nest could not select the given module (it does not exist in current context)',
    );
  }
}
