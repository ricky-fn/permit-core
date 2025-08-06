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

/**
 * Class representing an action for menu access.
 * @extends Action<T, P>
 * @template T - The type of the action.
 * @template P - The parameters for the menu access action.
 */
export class MenuAccessAction<
	T = MenuAccessActionType,
	P = IMenuAccessParameters,
> extends Action<T, P> {
	/**
	 * @param {string} roleCode - The code of the role associated with the action.
	 * @param {P} parameters - The parameters for the menu access action.
	 */
	constructor(
		protected roleCode: string,
		protected parameters: P,
	) {
		super(roleCode, "menu" as T, parameters);
	}
}

/**
 * Class representing a permission for menu access.
 * @extends ListAccessPermission
 * @template T - The type of the action.
 * @template R - The rules associated with the permission.
 *
 * @example
 * // Example of rules using an array of strings
 * const rulesArray = [
 *   { identifier: 'accessDashboard', list: ['menu1', 'menu2'], exclude: false },
 *   { identifier: 'manageUsers', list: ['menu3'], exclude: true }
 * ];
 *
 * // Example of rules where the list can also be a regex
 * const rulesWithRegexList = [
 *   { identifier: 'accessReports', list: /^menu\d$/, exclude: false }, // Matches any menu like menu1, menu2, etc.
 *   { identifier: 'manageSettings', list: ['menu3'], exclude: true }
 * ];
 *
 * // Combining both types of rules
 * const combinedRules = [
 *   { identifier: 'accessDashboard', list: ['menu1', 'menu2'], exclude: false },
 *   { identifier: /^manage/, list: /^menu\d$/, exclude: true } // Matches any menu like menu1, menu2, etc.
 * ];
 */
export class MenuAccessPermission<
	T extends string = MenuAccessActionType,
	R extends
		ListPermissionRule<ListAccessActionType>[] = ListPermissionRule<ListAccessActionType>[],
	A extends Action = MenuAccessAction,
> extends ListAccessPermission<T, R, A> {
	/**
	 * @param {Group | Role} target - The target group or role for the permission.
	 * @param {R} rules - The rules associated with the permission.
	 */
	constructor(
		protected target: Role | Group,
		rules: R,
	) {
		super(target, "menu" as T, rules);
	}
}
