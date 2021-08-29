import {UNKNOWN_DEPENDENCIES_MESSAGE} from "@/lib/exceptions";
import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";
import {InjectorDependencyContext, Module} from "@/lib/ioc";

export class UnknownDependenciesException extends RuntimeException {
  constructor(
    type: string | symbol,
    unknownDependencyContext: InjectorDependencyContext,
    module?: Module,
  ) {
    super(UNKNOWN_DEPENDENCIES_MESSAGE(type, unknownDependencyContext, module));
  }
}
