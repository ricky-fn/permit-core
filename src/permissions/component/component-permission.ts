import type {
	ComponentAccessActionType,
	IComponentAccessParameters,
	IComponentPermissionRule,
} from "./component-types";

import { Action, Group, Permission, PermissionMessage, Role } from "../../core";

/**
 * Class representing an action for component access.
 * @extends Action<ComponentAccessActionType, IComponentAccessParameters>
 */
export class ComponentAccessAction extends Action<
	ComponentAccessActionType,
	IComponentAccessParameters
> {
	/**
	 * @param {string} roleCode - The code of the role associated with the action.
	 * @param {IComponentAccessParameters} parameters - The parameters for the component access action.
	 */
	constructor(
		protected roleCode: string,
		protected parameters: IComponentAccessParameters,
	) {
		super(roleCode, "component", parameters);
	}
}

/**
 * Class representing a permission for component access.
 * @extends Permission<ComponentAccessActionType, IComponentPermissionRule>
 * @template T - The type of the action.
 * @template R - The rules associated with the permission.
 *
 * @example
 * // Example of rules using an array of strings
 * const rulesArray = [
 *   { identifier: 'accessDashboard', actions: ['view', 'edit'], exclude: false },
 *   { identifier: 'manageUsers', actions: ['delete'], exclude: true }
 * ];
 *
 * // Example of rules where the identifier can also be a regex
 * const rulesWithRegexIdentifier = [
 *   { identifier: /^access/, actions: ['view'], exclude: false }, // Matches any identifier starting with 'access'
 *   { identifier: 'manageSettings', actions: ['edit'], exclude: true }
 * ];
 *
 * // Combining both types of rules
 * const combinedRules = [
 *   { identifier: 'accessDashboard', actions: ['view', 'edit'], exclude: false },
 *   { identifier: /^manage/, actions: ['delete'], exclude: true } // Matches any identifier starting with 'manage'
 * ];
 */
export class ComponentAccessPermission extends Permission<
	ComponentAccessActionType,
	IComponentPermissionRule
> {
	/**
	 * @param {Group | Role} target - The target group or role for the permission.
	 * @param {IComponentPermissionRule[]} rules - The rules associated with the permission.
	 */
	constructor(
		protected target: Group | Role,
		protected rules: IComponentPermissionRule[],
	) {
		super(target, "component", rules);
	}

	/**
	 * Validate the action against the permission rules.
	 * @param {ComponentAccessAction} action - The action to validate.
	 * @returns {PermissionMessage | undefined} A message indicating the validation result or undefined if valid.
	 */
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

	/**
	 * Get the rules that match the action.
	 * @param {ComponentAccessAction} action - The action to check against the rules.
	 * @returns {IComponentPermissionRule[]} An array of valid rules for the action.
	 */
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
