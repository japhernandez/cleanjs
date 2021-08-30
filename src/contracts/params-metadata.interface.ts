import {ParamData} from "../decorators";

export type ParamsMetadata = Record<number, ParamMetadata>;
export interface ParamMetadata {
  index: number;
  data?: ParamData;
}
