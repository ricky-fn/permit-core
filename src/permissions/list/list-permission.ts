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
> extends Permission<T, R> {
	constructor(
		protected target: Role | Group,
		protected type: T = "list" as T,
		rules: R,
	) {
		super(target, type, rules);
	}
	validate(action: A) {
		if (action.getType() !== this.type) {
			return new PermissionMessage({
				status: "failed",
				message: "action type doesn't match the permission type",
				target: this.target,
				action,
			});
		}

		const matchedRules = this.getRulesByAction(action);

		if (matchedRules.length === 0) {
			return new PermissionMessage({
				status: "failed",
				message: `No access permission for menu '${(action.getParameters() as ListAccessParameters<string>).identifier}'`,
				target: this.target,
				action,
			});
		}
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
	getAccessibleList(action: A) {
		let accessibleList: string[] = [];
		const actionParameters =
			action.getParameters() as ListAccessParameters<string>;
		const requestedList = actionParameters[this.getType()];

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
							accessibleList = accessibleList.filter((item) => {
								return (
									(ruleList instanceof RegExp && !ruleList.test(item)) ||
									(ruleList instanceof Array && !ruleList.includes(item))
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
							roleAccessibleList = roleAccessibleList.filter((item) => {
								return (
									(ruleList instanceof RegExp && !ruleList.test(item)) ||
									(ruleList instanceof Array && !ruleList.includes(item))
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
}
