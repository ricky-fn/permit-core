import { Action, Group, Role } from "../../core";
import type {
	ListAccessActionType,
	ListPermissionRule,
} from "../list/list-types";
import { ListAccessPermission } from "../list/list-permission";
import type {
	DropdownAccessActionType,
	IDropdownAccessParameters,
	IDropdownPermissionRule,
} from "./dropdown-type";

export class DropdownAccessAction<
	T = DropdownAccessActionType,
	P extends IDropdownAccessParameters = IDropdownAccessParameters,
> extends Action<T, P> {
	constructor(
		protected roleCode: string,
		protected parameters: P,
	) {
		super(roleCode, "dropdown" as T, parameters);
	}
}

export class DropdownAccessPermission<
	T extends string = DropdownAccessActionType,
	R extends IDropdownPermissionRule[] = IDropdownPermissionRule[],
	A extends Action = DropdownAccessAction,
> extends ListAccessPermission<T, R, A> {
	constructor(
		protected target: Role | Group,
		protected rules: R,
	) {
		super(target, "dropdown" as T, rules);
	}
}
