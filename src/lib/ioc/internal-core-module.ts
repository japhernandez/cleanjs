import { requestProvider } from '../routers/request/request-providers';
import { inquirerProvider } from './inquirer/inquirer-providers';
import {Global, Module} from "@/lib/decorators";
import {Reflector} from "@/lib/services";
import {DynamicModule, ValueProvider} from "@/lib/contracts";


@Global()
@Module({
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
