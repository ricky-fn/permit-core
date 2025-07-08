import { Role, Permission, Action, Group, PermissionMessage } from "../../core";
import type {
	IRouteAccessParameters,
	IRoutePermissionRule,
	RouteAccessActionType,
} from "./route-types";

export class RouteAccessPermission extends Permission<
	RouteAccessActionType,
	IRoutePermissionRule
> {
	constructor(
		protected target: Role | Group,
		protected rules: IRoutePermissionRule[],
		protected middlewares: Array<
			(permission: RouteAccessPermission, action: RouteAccessAction) => void
		> = [],
	) {
		super(target, "navigation", rules);
	}
	getDefaultRoute() {
		return this.rules.find((rule) => rule.isDefault);
	}
	private getRulesByAction(action: RouteAccessAction) {
		const path = action.getParameters().route;
		let validRules: IRoutePermissionRule[] = [];

		for (const rule of this.rules) {
			if (rule.route instanceof RegExp && rule.route.test(path)) {
				if (rule.exclude) {
					validRules = [];
					continue; // if the exclude flag exist then reset the validRules to an empty array
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

export class RouteAccessAction extends Action<
	RouteAccessActionType,
	IRouteAccessParameters
> {
	constructor(
		protected roleCode: string,
		protected parameters: IRouteAccessParameters,
	) {
		super(roleCode, "navigation", parameters);
	}
}
