/**
 * Access Control Module - Main Entry Point
 *
 * Provides a comprehensive role-based access control system with:
 * - Flexible role/group hierarchies
 * - Route, component, and menu permission controls
 * - Extensible permission validation
 * - Type-safe API with full TypeScript support
 */

import { AccessControl, Group, Role } from "./core";
import {
	ComponentAccessAction,
	ComponentAccessPermission,
	type IComponentAccessParameters,
	type IComponentPermissionRule,
	type IMenuAccessParameters,
	type IMenuPermissionRule,
	type IRouteAccessParameters,
	type IRoutePermissionRule,
	MenuAccessAction,
	MenuAccessPermission,
	RouteAccessAction,
	RouteAccessPermission,
} from "./permissions";

// Core Access Control Classes
export {
	Role,
	Group,
	Permission,
	Action,
	AccessControl,
} from "./core/access-control";

// Permission Message Interface
export type { IPermissionMessage } from "./core/permission-message";

// Route Access Control
export {
	RouteAccessPermission,
	RouteAccessAction,
} from "./permissions/route/route-permission";

// Component Access Control
export {
	ComponentAccessPermission,
	ComponentAccessAction,
} from "./permissions/component/component-permission";

// Menu Access Control
export {
	MenuAccessPermission,
	MenuAccessAction,
} from "./permissions/menu/menu-permission";

// Permission Type Definitions
export type {
	RolePermissions,
	RolePermissionGroup,
	GroupPermissions,
	GroupPermissionGroup,
} from "./types/permission-types";

// Type Re-exports for consumer convenience
export type {
	Permission as PermissionType,
	Action as ActionType,
} from "./core/access-control";

/**
 * Default Module Initialization Function
 *
 * Creates a pre-configured AccessControl instance with common settings
 *
 * @param {Object} config - Configuration options
 * @param {Role[]} config.roles - Initial roles to register
 * @param {Group[]} [config.groups] - Initial groups to register
 *
 * @returns {AccessControl} Preconfigured access control instance
 */
export function createAccessControl(config: {
	roles: Role[];
	groups?: Group[];
}): AccessControl {
	return new AccessControl(config.roles);
}

/**
 * Permission Factory Functions
 *
 * Helper functions to create common permission types with proper configuration
 */

/**
 * Creates a route permission with validation rules
 *
 * @param target - Role or Group this permission applies to
 * @param rules - Route access rules
 * @param middlewares - Optional validation middlewares
 */
export function createRoutePermission(
	target: Role | Group,
	rules: IRoutePermissionRule[],
	middlewares: Array<
		(permission: RouteAccessPermission, action: RouteAccessAction) => void
	> = [],
): RouteAccessPermission {
	return new RouteAccessPermission(target, rules, middlewares);
}

/**
 * Creates a component permission with validation rules
 *
 * @param target - Role or Group this permission applies to
 * @param rules - Component access rules
 */
export function createComponentPermission(
	target: Role | Group,
	rules: IComponentPermissionRule[],
): ComponentAccessPermission {
	return new ComponentAccessPermission(target, rules);
}

/**
 * Creates a menu permission with validation rules
 *
 * @param target - Role or Group this permission applies to
 * @param rules - Menu access rules
 */
export function createMenuPermission(
	target: Role | Group,
	rules: IMenuPermissionRule[],
): MenuAccessPermission {
	return new MenuAccessPermission(target, rules);
}

/**
 * Creates a menu access action
 *
 * @param roleCode - The role code associated with the action
 * @param parameters - The parameters for the menu access action
 * @returns {MenuAccessAction} A new instance of MenuAccessAction
 */
export function createMenuAccessAction(
	roleCode: string,
	parameters: IMenuAccessParameters,
): MenuAccessAction {
	return new MenuAccessAction(roleCode, parameters);
}

/**
 * Creates a component access action
 *
 * @param roleCode - The role code associated with the action
 * @param parameters - The parameters for the component access action
 * @returns {ComponentAccessAction} A new instance of ComponentAccessAction
 */
export function createComponentAccessAction(
	roleCode: string,
	parameters: IComponentAccessParameters,
): ComponentAccessAction {
	return new ComponentAccessAction(roleCode, parameters);
}

/**
 * Creates a route access action
 *
 * @param roleCode - The role code associated with the action
 * @param parameters - The parameters for the route access action
 * @returns {RouteAccessAction} A new instance of RouteAccessAction
 */
export function createRouteAccessAction(
	roleCode: string,
	parameters: IRouteAccessParameters,
): RouteAccessAction {
	return new RouteAccessAction(roleCode, parameters);
}
