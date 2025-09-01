import {
	type IPermissionMessage,
	PermissionMessage,
} from "./permission-message.js";

/**
 * Interface for permission callbacks.
 * @template A
 */
interface IPermissionCallbacks<A extends Action> {
	/**
	 * Callback for when an action fails.
	 * @param {A} action - The action that failed.
	 * @param {Permission | null} permission - The permission that failed.
	 * @param {IPermissionMessage} message - The message associated with the failure.
	 */
	onFailure?: (
		action: A,
		permission: Permission | null,
		message: IPermissionMessage,
	) => void;

	/**
	 * Callback for when an action succeeds.
	 * @param {A} action - The action that succeeded.
	 * @param {Permission} permission - The permission that succeeded.
	 */
	onSuccess: (action: A, permission: Permission) => void;
}

/**
 * Abstract class for role-based access control.
 */
abstract class RoleAccessControl {
	/**
	 * @param {Role[]} roles - The roles associated with this access control.
	 * @param {Group[]} groups - The groups associated with this access control.
	 */
	constructor(
		protected roles: Role[],
		protected groups: Group[],
	) {}

	/**
	 * Allow developer to add a role.
	 * @param {Role} role - The role to add.
	 */
	abstract addRole(role: Role): void;

	/**
	 * Allow developer to add a group.
	 * @param {Group} group - The group to add.
	 */
	abstract addGroup(group: Group): void;

	/**
	 * Check permissions for a given action.
	 * @param {Action} action - The action to check permissions for.
	 * @param {IPermissionCallbacks<Action>} callbacks - Callbacks for success and failure.
	 */
	abstract checkPermissions(
		action: Action,
		callbacks: IPermissionCallbacks<Action>,
	): void;
}

/**
 * Class for managing access control.
 */
export class AccessControl extends RoleAccessControl {
	/**
	 * Add a role to the access control.
	 * @param {Role} role - The role to add.
	 */
	addRole(role: Role) {
		if (!this.roles.includes(role)) {
			this.roles.push(role);
		}
	}

	/**
	 * Add a group to the access control.
	 * @param {Group} group - The group to add.
	 */
	addGroup(group: Group) {
		if (!this.groups.includes(group)) {
			this.groups.push(group);
		}
	}

	/**
	 * Check permissions for a given action.
	 * @param {A extends Action} action - The action to check permissions for.
	 * @param {IPermissionCallbacks<A>} callbacks - Callbacks for success and failure.
	 */
	checkPermissions<A extends Action>(
		action: A,
		callbacks: IPermissionCallbacks<A>,
	): void {
		const roleCode = action.getRoleCode();
		const role = this.getRoleByCode(roleCode);

		if (!role) {
			if (callbacks.onFailure) {
				callbacks.onFailure(action, null, {
					action,
					message: "Role not found.",
					status: "failed",
				});
			}
			return;
		}

		const matchingPermissions = role.getPermissions(action.getType());

		if (matchingPermissions.length === 0) {
			if (callbacks.onFailure) {
				callbacks.onFailure(action, null, {
					action,
					message: "No matching permissions found.",
					status: "failed",
					target: role,
				});
			}
			return;
		}

		// Only the last permission is checked, since the rules are combined in the permission class
		const permission = matchingPermissions.at(-1);
		const result = permission!.validate(action);
		if (result instanceof PermissionMessage && result.status === "failed") {
			if (callbacks.onFailure) {
				callbacks.onFailure(action, permission!, result);
			}
			return;
		}

		callbacks.onSuccess(action, permission!);
	}

	/**
	 * Get a role by its code.
	 * @param {string} roleCode - The code of the role to retrieve.
	 * @returns {Role | undefined} The role associated with the code, or undefined if not found.
	 */
	getRoleByCode(roleCode: string) {
		return this.roles.find((role) => role.getCode() === roleCode);
	}

	/**
	 * Get all roles associated with this access control.
	 * @returns {Role[]} An array of roles.
	 */
	getRoles() {
		return this.roles;
	}

	/**
	 * Get all groups associated with this access control.
	 * @returns {Group[]} An array of groups.
	 */
	getGroups() {
		return this.groups;
	}

	/**
	 * Get a group by its code.
	 * @param {string} groupCode - The code of the group to retrieve.
	 * @returns {Group | undefined} The group associated with the code, or undefined if not found.
	 */
	getGroupByCode(groupCode: string) {
		return this.groups.find((group) => group.getCode() === groupCode);
	}
}

/**
 * Class representing an action.
 * @template T
 * @template P
 */
export class Action<T = string, P = object> {
	/**
	 * @param {string} roleCode - The code of the role associated with the action.
	 * @param {T} type - The type of the action.
	 * @param {P} parameters - The parameters associated with the action.
	 */
	constructor(
		protected roleCode: string,
		protected type: T,
		protected parameters: P,
	) {}

	/**
	 * Get the parameters of the action.
	 * @returns {P} The parameters.
	 */
	getParameters(): P {
		return this.parameters;
	}

	/**
	 * Get the role code associated with the action.
	 * @returns {string} The role code.
	 */
	getRoleCode(): string {
		return this.roleCode;
	}

	/**
	 * Get the type of the action.
	 * @returns {T} The type.
	 */
	getType(): T {
		return this.type;
	}
}

/**
 * Class representing a group of roles.
 * @template C
 */
export class Group<C extends string = string> {
	private permissions: Permission[] = [];
	private roles: Role[] = [];
	constructor(
		protected code: C,
		protected inheritFrom?: Group,
	) {}
	/**
	 * Assign a permission to the group.
	 * @param {Permission} permission - The permission to assign.
	 */
	assignPermission(permission: Permission): void {
		if (!this.permissions.includes(permission)) {
			this.permissions.push(permission);
		}
	}
	/**
	 * Assign a role to the group.
	 * @param {Role} role - The role to assign.
	 */
	assignRole(role: Role): void {
		const group = role.getGroup();
		if (group) {
			group.excludeRole(role);
			role.resetGroup();
		}

		if (!this.roles.includes(role) && !role.getGroup()) {
			this.roles.push(role);
			role.assignGroup(this);
		}
	}
	/**
	 * Exclude a role from the group.
	 * @param {Role} role - The role to exclude.
	 */
	excludeRole(role: Role) {
		this.roles = this.roles.filter((_role) => _role !== role);
	}
	/**
	 * Get the code of the group.
	 * @returns {C} The code.
	 */
	getCode() {
		return this.code;
	}
	/**
	 * Get permissions associated with the group.
	 * @param {string} [type] - Optional type to filter permissions.
	 * @returns {Permission[]} An array of permissions.
	 */
	getPermissions<P extends Permission = Permission>(type?: string): P[] {
		return type
			? (this.permissions.filter(
					(permission) => permission.getType() === type,
				) as P[])
			: (this.permissions as P[]);
	}
	/**
	 * Get all roles associated with the group.
	 * @returns {Role[]} An array of roles.
	 */
	getRoles(): Role[] {
		return this.roles;
	}
	/**
	 * Inherit permissions and roles from another group.
	 * @param {Group} group - The group to inherit from.
	 */
	getInheritFrom() {
		return this.inheritFrom;
	}
}

/**
 * Abstract class representing a permission.
 * @template T
 * @template R
 */

export abstract class Permission<T = string, R extends unknown[] = unknown[]> {
	rules: R;
	/**
	 * @param {Group | Role} target - The target of the permission (group or role).
	 * @param {T} type - The type of the permission.
	 * @param {R[]} rules - The rules associated with the permission.
	 */
	constructor(
		protected target: Role | Group,
		protected type: T,
		rules: R,
	) {
		target.assignPermission(this as unknown as Permission);

		this.rules = rules as R;
	}

	/**
	 * Add a rule to the permission.
	 * @param {R} rule - The rule to add.
	 * @returns {this} The current instance for chaining.
	 */
	addRule(rule: R[number]): this {
		this.rules.push(rule);
		return this;
	}

	/**
	 * Get the rules associated with the permission, including inherited rules from parent groups.
	 * @returns {R[]} An array of rules.
	 */
	getRules(): R {
		let combinedRules = [];
		if (this.target instanceof Role && this.target.getGroup()) {
			const inheritedRules = this.target
				.getGroup()!
				.getPermissions(this.type as string)
				.map((permission) => permission.getRules())
				.flat();
			combinedRules = [...inheritedRules, ...this.rules];
		} else if (this.target instanceof Group && this.target.getInheritFrom()) {
			const inheritedRules = this.target
				.getInheritFrom()!
				.getPermissions(this.type as string)
				.map((permission) => permission.getRules())
				.flat();
			combinedRules = [...inheritedRules, ...this.rules];
		} else {
			combinedRules = [...this.rules];
		}

		return combinedRules as R;
	}

	/**
	 * Get the target of the permission.
	 * @returns {Group | Role} The target.
	 */
	getTarget() {
		return this.target;
	}

	/**
	 * Get the type of the permission.
	 * @returns {T} The type.
	 */
	getType(): T {
		return this.type;
	}

	/**
	 * Retrieves the rules inherited from a parent group if the target is a group and inheritance is enabled.
	 * This method checks if the target is a `Group` instance and if it has a parent group (`inheritFrom`).
	 * If so, it collects the rules from the parent group's permissions of the same type and returns them.
	 * If no inheritance is found, it returns an empty array.
	 *
	 * @returns {R} An array of rules inherited from the parent group, or an empty array if no inheritance exists.
	 */
	getRulesByGroupInheritance(): R {
		if (this.target instanceof Group && this.target.getInheritFrom()) {
			const inheritedPermissions =
				this.target.getInheritFrom()?.getPermissions(this.type as string) || [];
			return inheritedPermissions
				.map((permission) => permission.getRules())
				.flat() as R;
		}
		return [] as unknown as R;
	}

	/**
	 * Validate an action against the permission.
	 * @param {Action} action - The action to validate.
	 * @returns {IPermissionMessage | undefined} The validation message or undefined if valid.
	 */
	abstract validate(action: Action): IPermissionMessage | undefined;
}

/**
 * Class representing a role.
 * @template C
 * @template T
 */
export class Role<C extends string = string, T = unknown> {
	private group?: Group;
	private permissions: Permission[] = [];
	constructor(
		protected code: C,
		protected config?: T,
	) {}

	/**
	 * Assign a group to the role.
	 * @param {Group} group - The group to assign.
	 */
	assignGroup(group: Group) {
		if (!this.group) {
			this.group = group;
		} else {
			throw new Error(
				`role ${this.code} has already assigned to another group: ${this.group.getCode()}`,
			);
		}
	}

	/**
	 * Assign a permission to the role.
	 * @param {Permission} permission - The permission to assign.
	 */
	assignPermission(permission: Permission) {
		if (!this.permissions.includes(permission)) {
			if (this.group) {
				if (!this.group.getPermissions().includes(permission)) {
					this.permissions.push(permission);
				}
			} else {
				this.permissions.push(permission);
			}
		}
	}

	/**
	 * Get the code of the role.
	 * @returns {C} The code.
	 */
	getCode(): C {
		return this.code;
	}

	/**
	 * Get the configuration of the role.
	 * @returns {T | undefined} The configuration or undefined if not set.
	 */
	getConfig(): T | undefined {
		return this.config;
	}

	/**
	 * Get the group associated with the role.
	 * @returns {Group | undefined} The group or undefined if not assigned.
	 */
	getGroup() {
		return this.group;
	}

	/**
	 * Get permissions associated with the role.
	 * @param {string} [type] - Optional type to filter permissions.
	 * @returns {Permission[]} An array of permissions.
	 */
	getPermissions<P extends Permission = Permission>(type?: string): P[] {
		const rolePermissions = type
			? (this.permissions.filter(
					(permission) => permission.getType() === type,
				) as P[])
			: (this.permissions as P[]);
		const groupPermissions = this.group
			? (this.group.getPermissions(type) as P[])
			: [];

		return [...groupPermissions, ...rolePermissions];
	}

	/**
	 * Reset the group associated with the role.
	 */
	resetGroup() {
		this.group = undefined;
	}
}
