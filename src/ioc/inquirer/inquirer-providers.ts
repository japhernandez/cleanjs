import { INQUIRER } from './inquirer-constants';
import {Provider, Scope} from "../../contracts";

const noop = () => {}
export const inquirerProvider: Provider = {
  provide: INQUIRER,
  scope: Scope.TRANSIENT,
  useFactory: noop,
};
