import {ScopeOptions} from "../contracts";
import {SCOPE_OPTIONS_METADATA} from "../utils";

export function Adapter(options?: ScopeOptions): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
    };
}
