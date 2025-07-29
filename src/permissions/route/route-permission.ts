import { Role, Permission, Action, Group, PermissionMessage } from "../../core";
import type {
	IRouteAccessParameters,
	IRoutePermissionRule,
	RouteAccessActionType,
} from "./route-types";

/**
 * Class representing a permission for route access.
 * @extends Permission
 * @template T - The type of the action.
 * @template R - The rules associated with the permission.
 *
 * @example
 * // Example of rules using an array of strings
 * const rulesArray = [
 *   { route: '/home', exclude: false, isDefault: true },
 *   { route: '/admin', exclude: true, isDefault: false }
 * ];
 *
 * // Example of rules using a regular expression for route
 * const rulesRegex = [
 *   { route: /^\/user\/\d+$/, exclude: false, isDefault: false },
 *   { route: /^\/admin/, exclude: true, isDefault: false }
 * ];
 */
export class RouteAccessPermission extends Permission<
	RouteAccessActionType,
	IRoutePermissionRule
> {
	/**
	 * @param {Role | Group} target - The target role or group for the permission.
	 * @param {IRoutePermissionRule[]} rules - The rules associated with the permission.
	 * @param {Array<function(RouteAccessPermission, RouteAccessAction): void>} [middlewares=[]] - Optional middlewares to apply during validation.
	 */
	constructor(
		protected target: Role | Group,
		protected rules: IRoutePermissionRule[],
		protected middlewares: Array<
			(permission: RouteAccessPermission, action: RouteAccessAction) => void
		> = [],
	) {
		super(target, "navigation", rules);
	}

	/**
	 * Get the default route from the rules.
	 * @returns {IRoutePermissionRule | undefined} The default route rule or undefined if not found.
	 */
	getDefaultRoute() {
		return this.rules.find((rule) => rule.isDefault);
	}

	/**
	 * Get the rules that match the action based on the route.
	 * @param {RouteAccessAction} action - The action to check against the rules.
	 * @returns {IRoutePermissionRule[]} An array of valid rules for the action.
	 */
	private getRulesByAction(action: RouteAccessAction) {
		const path = action.getParameters().route;
		let validRules: IRoutePermissionRule[] = [];

		for (const rule of this.rules) {
			if (rule.route instanceof RegExp && rule.route.test(path)) {
				if (rule.exclude) {
					validRules = [];
					continue; // if the exclude flag exists then reset the validRules to an empty array
				}
				validRules.push(rule);
			} else if (rule.route === path) {
				if (rule.exclude) {
					validRules = [];
					continue;
				}
				validRules.push(rule);
			}
		}

		return validRules;
	}

	/**
	 * Validate the action against the permission rules.
	 * @param {RouteAccessAction} action - The action to validate.
	 * @returns {PermissionMessage | undefined} A message indicating the validation result or undefined if valid.
	 */
	validate(action: RouteAccessAction) {
		if (action.getType() !== this.type) {
			return new PermissionMessage({
				status: "failed",
				message: "action type doesn't match the permission type",
				target: this.target,
				action,
			});
		}

		const matchedRules = this.getRulesByAction(action);

		this.middlewares.forEach((middleware) => {
			middleware(this, action);
		});

		if (matchedRules.length === 0) {
			return new PermissionMessage({
				status: "failed",
				message: "route access is not allowed",
				target: this.target,
				action,
			});
		}
	}
}

/**
 * Class representing an action for route access.
 * @extends Action
 * @template T - The type of the action.
 * @template P - The parameters for the route access action.
 */
export class RouteAccessAction extends Action<
	RouteAccessActionType,
	IRouteAccessParameters
> {
	/**
	 * @param {string} roleCode - The code of the role associated with the action.
	 * @param {IRouteAccessParameters} parameters - The parameters for the route access action.
	 */
	constructor(
		protected roleCode: string,
		protected parameters: IRouteAccessParameters,
	) {
		super(roleCode, "navigation", parameters);
	}
}
