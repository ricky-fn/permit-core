import type {
	IMenuAccessParameters,
	IMenuPermissionRule,
	MenuAccessActionType,
} from "./menu-types";

import { Action, Group, Role } from "../../core";
import { ListAccessPermission } from "../list/list-permission";

export class MenuAccessAction<
	T = MenuAccessActionType,
	P = IMenuAccessParameters,
> extends Action<T, P> {
	constructor(
		protected roleCode: string,
		protected parameters: P,
	) {
		super(roleCode, "menu" as T, parameters);
	}
}

export class MenuAccessPermission<
	T extends string = MenuAccessActionType,
	R extends IMenuPermissionRule[] = IMenuPermissionRule[],
	A extends Action = MenuAccessAction,
> extends ListAccessPermission<T, R, A> {
	constructor(
		protected target: Group | Role,
		protected rules: R,
	) {
		super(target, "menu" as T, rules);
	}
}
