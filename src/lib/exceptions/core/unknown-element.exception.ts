import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";

export class UnknownElementException extends RuntimeException {
  constructor(name?: string | symbol) {
    name = name && name.toString();
    super(
      `Nest could not find ${
        name || 'given'
      } element (this provider does not exist in the current context)`,
    );
  }
}
