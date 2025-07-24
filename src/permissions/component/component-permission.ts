import type {
	ComponentAccessActionType,
	IComponentAccessParameters,
	IComponentPermissionRule,
} from "./component-types";

import { Action, Group, Permission, PermissionMessage, Role } from "../../core";

export class ComponentAccessAction extends Action<
	ComponentAccessActionType,
	IComponentAccessParameters
> {
	constructor(
		protected roleCode: string,
		protected parameters: IComponentAccessParameters,
	) {
		super(roleCode, "component", parameters);
	}
}

export class ComponentAccessPermission extends Permission<
	ComponentAccessActionType,
	IComponentPermissionRule[]
> {
	constructor(
		protected target: Group | Role,
		rules: IComponentPermissionRule[],
	) {
		super(target, "component", rules);
	}
	validate(action: ComponentAccessAction) {
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
				message: `action ${action.getParameters().action} are not allowed to perform in this component`,
				status: "failed",
				target: this.target,
			});
		}
	}
	private getRulesByAction(action: ComponentAccessAction) {
		const accessIdentifier = action.getParameters().identifier;
		const accessAction = action.getParameters().action;
		let validRules: IComponentPermissionRule[] = [];

		for (const rule of this.rules) {
			let validRule: IComponentPermissionRule | undefined = undefined;
			if (
				rule.identifier instanceof RegExp &&
				rule.identifier.test(accessIdentifier)
			) {
				validRule = rule;
			} else if (rule.identifier === accessIdentifier) {
				validRule = rule;
			}

			if (validRule?.actions.includes(accessAction)) {
				if (validRule.exclude) {
					validRules = [];
					continue;
				}
				validRules.push(validRule);
			}
		}

		return validRules;
	}
}
