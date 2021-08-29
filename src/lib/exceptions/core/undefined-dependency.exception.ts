import {RuntimeException} from "@/lib/exceptions/core/runtime.exception";
import {InjectorDependencyContext, Module} from "@/lib/ioc";
import {UNKNOWN_DEPENDENCIES_MESSAGE} from "@/lib/exceptions";

export class UndefinedDependencyException extends RuntimeException {
  constructor(
    type: string,
    undefinedDependencyContext: InjectorDependencyContext,
    module?: Module,
  ) {
    super(
      UNKNOWN_DEPENDENCIES_MESSAGE(type, undefinedDependencyContext, module),
    );
  }
}
