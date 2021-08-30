import { RouteParamtypes } from '../enums';
import {Paramtype} from "../contracts";

export class ParamsTokenFactory {
  public exchangeEnumForString(type: RouteParamtypes): Paramtype {
    switch (type) {
      case RouteParamtypes.BODY:
        return 'body';
      case RouteParamtypes.PARAM:
        return 'param';
      case RouteParamtypes.QUERY:
        return 'query';
      default:
        return 'custom';
    }
  }
}
