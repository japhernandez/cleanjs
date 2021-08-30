import { requestProvider } from '../routers';
import { inquirerProvider } from './inquirer';
import {Global, Container} from "../decorators";
import {Reflector} from "../services";
import {DynamicModule, ValueProvider} from "../contracts";

@Global()
@Container({
  providers: [Reflector, requestProvider, inquirerProvider],
  exports: [Reflector, requestProvider, inquirerProvider],
})
export class InternalCoreModule {
  static register(providers: ValueProvider[]): DynamicModule {
    return {
      module: InternalCoreModule,
      providers: [...providers],
      exports: [...providers.map(item => item.provide)],
    };
  }
}
