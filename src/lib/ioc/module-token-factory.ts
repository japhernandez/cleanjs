import stringify from 'fast-safe-stringify';
import hash from 'object-hash';
import { randomStringGenerator } from '../utils/random-string-generator.util';
import {DynamicModule, Type} from "@/lib/contracts";

export class ModuleTokenFactory {
  private readonly moduleIdsCache = new WeakMap<Type<unknown>, string>();

  public create(
    metatype: Type<unknown>,
    dynamicModuleMetadata?: Partial<DynamicModule> | undefined,
  ): string {
    const moduleId = this.getModuleId(metatype);
    const opaqueToken = {
      id: moduleId,
      module: this.getModuleName(metatype),
      dynamic: this.getDynamicMetadataToken(dynamicModuleMetadata),
    };
    return hash(opaqueToken, { ignoreUnknown: true });
  }

  public getDynamicMetadataToken(
    dynamicModuleMetadata: Partial<DynamicModule> | undefined,
  ): string {
    // Uses safeStringify instead of JSON.stringify to support circular dynamic modules
    // The replacer function is also required in order to obtain real class names
    // instead of the unified "Function" key
    return dynamicModuleMetadata
      ? stringify(dynamicModuleMetadata, this.replacer)
      : '';
  }

  public getModuleId(metatype: Type<unknown>): string {
    let moduleId = this.moduleIdsCache.get(metatype);
    if (moduleId) {
      return moduleId;
    }
    moduleId = randomStringGenerator();
    this.moduleIdsCache.set(metatype, moduleId);
    return moduleId;
  }

  public getModuleName(metatype: Type<any>): string {
    return metatype.name;
  }

  private replacer(key: string, value: any) {
    if (typeof value === 'function') {
      const funcAsString = value.toString();
      const isClass = /^class\s/.test(funcAsString);
      if (isClass) {
        return value.name;
      }
      return hash(funcAsString, { ignoreUnknown: true });
    }
    if (typeof value === 'symbol') {
      return value.toString();
    }
    return value;
  }
}
