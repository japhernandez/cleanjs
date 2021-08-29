import { ContextId } from '../ioc';
import {Controller} from "./index";
import {ExceptionsHandler} from "@/lib/exceptions/exceptions-handler";

export interface ExceptionsFilter {
  create(
    instance: Controller,
    callback: Function,
    module: string,
    contextId?: ContextId,
    inquirerId?: string,
  ): ExceptionsHandler;
}
