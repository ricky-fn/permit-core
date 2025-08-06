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

/**
 * Class representing an action for dropdown access.
 * @extends Action<T, P>
 * @template T - The type of the action.
 * @template P - The parameters for the dropdown access action.
 */
export class DropdownAccessAction<
	T = DropdownAccessActionType,
	P extends IDropdownAccessParameters = IDropdownAccessParameters,
> extends Action<T, P> {
	/**
	 * @param {string} roleCode - The code of the role associated with the action.
	 * @param {P} parameters - The parameters for the dropdown access action.
	 */
	constructor(
		protected roleCode: string,
		protected parameters: P,
	) {
		super(roleCode, "dropdown" as T, parameters);
	}
}

/**
 * Class representing a permission for dropdown access.
 * @extends ListAccessPermission
 * @template T - The type of the action.
 * @template R - The rules associated with the permission.
 *
 * @example
 * // Example of rules using an array of strings
 * const rulesArray = [
 *   { identifier: 'select', list: ['dropdown1', 'dropdown2'], exclude: false },
 *   { identifier: 'filter', list: ['dropdown3'], exclude: true }
 * ];
 *
 * // Example of rules where both identifier and list can also be regex
 * const rulesWithRegexList = [
 *   { identifier: /^select/, list: /^dropdown\d$/, exclude: false }, // Matches any dropdown like dropdown1, dropdown2, etc.
 *   { identifier: 'filter', list: ['dropdown3'], exclude: true },
 * ];
 *
 * // Combining both types of rules
 * const combinedRules = [
 *   { identifier: /^select/, list: ['dropdown1', 'dropdown2'], exclude: false },
 *   { identifier: /^filter/, list: /^dropdown\d$/, exclude: true }, // Matches any dropdown like dropdown1, dropdown2, etc.
 * ];
 */
export class DropdownAccessPermission<
	T extends string = DropdownAccessActionType,
	R extends
		ListPermissionRule<ListAccessActionType>[] = ListPermissionRule<ListAccessActionType>[],
	A extends Action = DropdownAccessAction,
> extends ListAccessPermission<T, R, A> {
	/**
	 * @param {Group | Role} target - The target group or role for the permission.
	 * @param {R} rules - The rules associated with the permission.
	 */
	constructor(
		protected target: Role | Group,
		rules: R,
	) {
		super(target, "dropdown" as T, rules);
	}
}
