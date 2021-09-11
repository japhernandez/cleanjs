import {RuntimeException} from "./runtime.exception";
import {IInjectorDependencyContext, Module} from "../ioc";
import {UNKNOWN_DEPENDENCIES_MESSAGE} from "./messages";

export class UndefinedDependencyException extends RuntimeException {
  constructor(type: string, undefinedDependencyContext: IInjectorDependencyContext, module?: Module) {
    super(
      UNKNOWN_DEPENDENCIES_MESSAGE(type, undefinedDependencyContext, module),
    );
  }
}
