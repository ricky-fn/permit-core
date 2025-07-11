import { Action, Group, Permission, PermissionMessage, Role } from "../../core";
import type {
	ListAccessActionType,
	ListAccessParameters,
	ListPermissionRule,
} from "./list-types";

import { findSharedMembers, mergeArrays } from "../../utilities";

export class ListAccessAction<
	T extends string = ListAccessActionType,
	P = ListAccessParameters<T>,
> extends Action<T, P> {
	constructor(
		protected roleCode: string,
		protected parameters: P,
	) {
		super(roleCode, "list" as T, parameters);
	}
}

export class ListAccessPermission<
	T extends string = ListAccessActionType,
	R extends
		ListPermissionRule<ListAccessActionType>[] = ListPermissionRule<ListAccessActionType>[],
	A extends Action = ListAccessAction,
> extends Permission {
	constructor(
		protected target: Group | Role,
		protected type: T,
		protected rules: R,
	) {
		super(target, "list", rules);
	}
	getAccessibleList(action: A) {
		let accessibleList: string[] = [];
		const actionParameters =
			action.getParameters() as ListAccessParameters<string>;
		const requestedList = actionParameters[action.getType()];

		if (this.target instanceof Group) {
			const rules: ListPermissionRule<ListAccessActionType>[] =
				this.getRulesByAction(action);

			rules.forEach((rule) => {
				requestedList.forEach((requestMenu) => {
					const ruleList = rule.list;
					if (
						(ruleList instanceof RegExp && ruleList.test(requestMenu)) ||
						(ruleList instanceof Array && ruleList.includes(requestMenu))
					) {
						if (!rule.exclude) {
							accessibleList.push(requestMenu);
						} else {
							accessibleList = accessibleList.filter((menu) => {
								return (
									(ruleList instanceof RegExp && !ruleList.test(menu)) ||
									(ruleList instanceof Array && !ruleList.includes(menu))
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
				requestedList.forEach((requestMenu) => {
					const ruleList = rule.list;
					if (
						(ruleList instanceof RegExp && ruleList.test(requestMenu)) ||
						(ruleList instanceof Array && ruleList.includes(requestMenu))
					) {
						if (!rule.exclude) {
							roleAccessibleList.push(requestMenu);
						} else {
							roleAccessibleList = roleAccessibleList.filter((menu) => {
								return (
									(ruleList instanceof RegExp && !ruleList.test(menu)) ||
									(ruleList instanceof Array && !ruleList.includes(menu))
								);
							});
						}
					}
				});
			});

			const group = this.target.getGroup();
			if (group) {
				const listAccessPermissions = group.getPermissions(
					"menu",
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
				message: `No access permission for menu '${(action.getParameters() as ListAccessParameters<string>).identifier}'`,
				status: "failed",
				target: this.target,
			});
		}
	}
}
