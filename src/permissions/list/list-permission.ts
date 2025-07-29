import { Action, Group, Permission, PermissionMessage, Role } from "../../core";
import type {
	ListAccessActionType,
	ListAccessParameters,
	ListPermissionRule,
} from "./list-types";

import { findSharedMembers, mergeArrays } from "../../utilities";

/**
 * Class representing an action for list access.
 * @extends Action<T, P>
 * @template T - The type of the action.
 * @template P - The parameters for the list access action.
 */
export class ListAccessAction<
	T extends string = ListAccessActionType,
	P = ListAccessParameters<T>,
> extends Action<T, P> {
	/**
	 * @param {string} roleCode - The code of the role associated with the action.
	 * @param {P} parameters - The parameters for the list access action.
	 */
	constructor(
		protected roleCode: string,
		protected parameters: P,
	) {
		super(roleCode, "list" as T, parameters);
	}
}

/**
 * Class representing a permission for list access.
 * @extends Permission
 * @template T - The type of the action.
 * @template R - The rules associated with the permission.
 *
 * @example
 * // Example of rules using an array of strings
 * const rulesArray = [
 *   { identifier: 'view', list: ['item1', 'item2'], exclude: false },
 *   { identifier: 'edit', list: ['item3'], exclude: true }
 * ];
 *
 * // Example of rules where the list can also be a regex
 * const rulesWithRegexList = [
 *   { identifier: 'view', list: /^item\d$/, exclude: false }, // Matches any item like item1, item2, etc.
 *   { identifier: 'edit', list: ['item3'], exclude: true }
 * ];
 *
 * // Combining both types of rules
 * const combinedRules = [
 *   { identifier: 'view', list: ['item1', 'item2'], exclude: false },
 *   { identifier: /^edit/, list: /^item\d$/, exclude: true } // Matches any item like item1, item2, etc.
 * ];
 */
export class ListAccessPermission<
	T extends string = ListAccessActionType,
	R extends
		ListPermissionRule<ListAccessActionType>[] = ListPermissionRule<ListAccessActionType>[],
	A extends Action = ListAccessAction,
> extends Permission {
	/**
	 * @param {Group | Role} target - The target group or role for the permission.
	 * @param {T} type - The type of the action.
	 * @param {R} rules - The rules associated with the permission.
	 */
	constructor(
		protected target: Group | Role,
		protected type: T,
		protected rules: R,
	) {
		super(target, "list", rules);
	}

	/**
	 * Get the accessible list based on the action.
	 * @param {A} action - The action to validate against the rules.
	 * @returns {string[]} An array of accessible list items.
	 */
	getAccessibleList(action: A) {
		let accessibleList: string[] = [];
		const actionParameters =
			action.getParameters() as ListAccessParameters<string>;
		const requestedList = actionParameters[action.getType()];

		if (this.target instanceof Group) {
			const rules: ListPermissionRule<ListAccessActionType>[] =
				this.getRulesByAction(action);

			rules.forEach((rule) => {
				requestedList.forEach((requestList) => {
					const ruleList = rule.list;
					if (
						(ruleList instanceof RegExp && ruleList.test(requestList)) ||
						(ruleList instanceof Array && ruleList.includes(requestList))
					) {
						if (!rule.exclude) {
							accessibleList.push(requestList);
						} else {
							accessibleList = accessibleList.filter((list) => {
								return (
									(ruleList instanceof RegExp && !ruleList.test(list)) ||
									(ruleList instanceof Array && !ruleList.includes(list))
								);
							});
						}
					}
				});
			});
		}

		if (this.target instanceof Role) {
			const rules: ListPermissionRule<ListAccessActionType>[] =
				this.getRulesByAction(action);
			let roleAccessibleList: string[] = [];

			rules.forEach((rule) => {
				requestedList.forEach((requestList) => {
					const ruleList = rule.list;
					if (
						(ruleList instanceof RegExp && ruleList.test(requestList)) ||
						(ruleList instanceof Array && ruleList.includes(requestList))
					) {
						if (!rule.exclude) {
							roleAccessibleList.push(requestList);
						} else {
							roleAccessibleList = roleAccessibleList.filter((list) => {
								return (
									(ruleList instanceof RegExp && !ruleList.test(list)) ||
									(ruleList instanceof Array && !ruleList.includes(list))
								);
							});
						}
					}
				});
			});

			const group = this.target.getGroup();
			if (group) {
				const listAccessPermissions = group.getPermissions(
					action.getType(),
				) as ListAccessPermission[];

				if (listAccessPermissions.length > 0) {
					listAccessPermissions.forEach((permission) => {
						accessibleList = mergeArrays(
							accessibleList,
							permission.getAccessibleList(action as any),
						);
					});
				}

				return findSharedMembers(accessibleList, roleAccessibleList);
			}

			return roleAccessibleList;
		}

		return accessibleList;
	}

	/**
	 * Get the rules that match the action.
	 * @param {A} action - The action to check against the rules.
	 * @returns {ListPermissionRule<ListAccessActionType>[]} An array of valid rules for the action.
	 */
	getRulesByAction(action: A) {
		const accessIdentifier = (
			action.getParameters() as ListAccessParameters<string>
		).identifier;
		const validRules: ListPermissionRule<ListAccessActionType>[] = [];

		for (const rule of this.rules) {
			let identifierMatchedRule:
				| ListPermissionRule<ListAccessActionType>
				| undefined = undefined;
			if (
				rule.identifier instanceof RegExp &&
				rule.identifier.test(accessIdentifier)
			) {
				identifierMatchedRule = rule;
			} else if (rule.identifier === accessIdentifier) {
				identifierMatchedRule = rule;
			}

			if (identifierMatchedRule) {
				validRules.push(identifierMatchedRule);
			}
		}

		return validRules;
	}

	/**
	 * Validate the action against the permission rules.
	 * @param {A} action - The action to validate.
	 * @returns {PermissionMessage | undefined} A message indicating the validation result or undefined if valid.
	 */
	validate(action: A) {
		if (action.getType() !== this.type) {
			return new PermissionMessage({
				action,
				message: "action type doesn't match the permission type",
				status: "failed",
				target: this.target,
			});
		}

		const matchedRules = this.getRulesByAction(action);

		if (matchedRules.length === 0) {
			return new PermissionMessage({
				action,
				message: `No access permission for ${action.getType()} '${(action.getParameters() as ListAccessParameters<string>).identifier}'`,
				status: "failed",
				target: this.target,
			});
		}
	}
}
