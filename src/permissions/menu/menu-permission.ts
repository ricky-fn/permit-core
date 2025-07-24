import type {
	IMenuAccessParameters,
	IMenuPermissionRule,
	MenuAccessActionType,
} from "./menu-types";

import { Action, Group, Role } from "../../core";
import { ListAccessPermission } from "../list/list-permission";
import type {
	ListAccessActionType,
	ListPermissionRule,
} from "../list/list-types";

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
	R extends
		ListPermissionRule<ListAccessActionType>[] = ListPermissionRule<ListAccessActionType>[],
	A extends Action = MenuAccessAction,
> extends ListAccessPermission<T, R, A> {
	constructor(
		protected target: Role | Group,
		rules: R,
	) {
		super(target, "menu" as T, rules);
	}
}
