import { Action } from "./access-control.js";
import { Group } from "./access-control.js";
import { Role } from "./access-control.js";

export interface IPermissionMessage {
  status: "success" | "failed";
  message?: string;
  target?: Role | Group;
  action?: Action;
}

export class PermissionMessage implements IPermissionMessage {
  status: "success" | "failed";
  message?: string;
  target?: Role | Group;
  action?: Action;
  constructor({ status, message, target, action }: IPermissionMessage) {
    this.status = status;
    this.message = message;
    this.target = target;
    this.action = action;
  }
}
