import { INQUIRER } from './inquirer-constants';
import {Provider, Scope} from "@/lib/contracts";

const noop = () => {};
export const inquirerProvider: Provider = {
  provide: INQUIRER,
  scope: Scope.TRANSIENT,
  useFactory: noop,
};
