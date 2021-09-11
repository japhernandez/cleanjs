import {RuntimeException} from "./runtime.exception";
import {IInjectorDependencyContext, Module} from "../ioc";
import {UNKNOWN_DEPENDENCIES_MESSAGE} from "./messages";

export class UnknownDependenciesException extends RuntimeException {
  constructor(type: string | symbol, unknownDependencyContext: IInjectorDependencyContext, module?: Module) {
    super(UNKNOWN_DEPENDENCIES_MESSAGE(type, unknownDependencyContext, module));
  }
}
