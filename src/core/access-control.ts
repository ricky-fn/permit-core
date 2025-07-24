import {
	type IPermissionMessage,
	PermissionMessage,
} from "./permission-message.js";

interface IPermissionCallbacks<A> {
	onFailure?: (action: A, message: IPermissionMessage) => void;
	onSuccess: (action: A) => void;
}

abstract class RoleAccessControl {
	constructor(protected roles: Role[]) {}

	// Allow developer to add role
	abstract addRole(role: Role): void;

	// Checking Permissions
	abstract checkPermissions(
		action: Action,
		callbacks: IPermissionCallbacks<Action>,
	): void;
}

export class AccessControl extends RoleAccessControl {
	addRole(role: Role) {
		if (!this.roles.includes(role)) {
			this.roles.push(role);
		}
	}
	checkPermissions<A extends Action>(
		action: A,
		callbacks: IPermissionCallbacks<A>,
	): void {
		const roleCode = action.getRoleCode();
		const role = this.getRoleByCode(roleCode);

		if (!role) {
			if (callbacks.onFailure) {
				callbacks.onFailure(action, {
					action,
					message: "Role not found.",
					status: "failed",
				});
			}
			return;
		}

		const matchingPermissions = role.getPermissions(action.getType());

		if (matchingPermissions.length === 0 && callbacks.onFailure) {
			callbacks.onFailure(action, {
				action,
				message: "No matching permissions found.",
				status: "failed",
				target: role,
			});
			return;
		}

		for (const permission of matchingPermissions) {
			const result = permission.validate(action);
			if (
				result instanceof PermissionMessage &&
				result.status === "failed" &&
				callbacks.onFailure
			) {
				callbacks.onFailure(action, result);
				return;
			}
		}

		callbacks.onSuccess(action);
	}
	getRoleByCode(roleCode: string) {
		return this.roles.find((role) => role.getCode() === roleCode);
	}
	getRoles() {
		return this.roles;
	}
}

export class Action<T = string, P = object> {
	constructor(
		protected roleCode: string,
		protected type: T,
		protected parameters: P,
	) {}

	getParameters(): P {
		return this.parameters;
	}

	getRoleCode(): string {
		return this.roleCode;
	}

	getType(): T {
		return this.type;
	}
}

export class Group<C extends string = string> {
	private permissions: Permission[] = [];
	private roles: Role[] = [];
	constructor(
		protected code: C,
		protected inheritFrom?: Group,
	) {}
	assignPermission(permission: Permission): void {
		if (!this.permissions.includes(permission)) {
			this.permissions.push(permission);
		}
	}
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
	excludeRole(role: Role) {
		this.roles = this.roles.filter((_role) => _role !== role);
	}
	getCode() {
		return this.code;
	}
	getPermissions(type?: string) {
		return type
			? this.permissions.filter((permission) => permission.getType() === type)
			: this.permissions;
	}
	getRoles(): Role[] {
		return this.roles;
	}
	getInheritFrom() {
		return this.inheritFrom;
	}
}

export abstract class Permission<T = string, R extends unknown[] = unknown[]> {
	rules: R;
	constructor(
		protected target: Role | Group,
		protected type: T,
		rules: R,
	) {
		target.assignPermission(this as unknown as Permission);

		let combinedRules = [];
		if (this.target instanceof Role && this.target.getGroup()) {
			const inheritedRules = this.target
				.getGroup()!
				.getPermissions(this.type as string)
				.map((permission) => permission.getRules())
				.flat();
			combinedRules = [...inheritedRules, ...rules];
		} else if (this.target instanceof Group && this.target.getInheritFrom()) {
			const inheritedRules = this.target
				.getInheritFrom()!
				.getPermissions(this.type as string)
				.map((permission) => permission.getRules())
				.flat();
			combinedRules = [...inheritedRules, ...rules];
		} else {
			combinedRules = [...rules];
		}

		this.rules = combinedRules as R;
	}

	addRule(rule: R): this {
		if (this.rules instanceof Array) {
			this.rules.push(rule);
		}
		return this;
	}

	getRules(): R {
		return this.rules;
	}

	getTarget() {
		return this.target;
	}

	getType(): T {
		return this.type;
	}

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

	abstract validate(action: Action): IPermissionMessage | undefined;
}

export class Role<C extends string = string, T = unknown> {
	private group?: Group;
	private permissions: Permission[] = [];
	constructor(
		protected code: C,
		protected config?: T,
	) {}

	assignGroup(group: Group) {
		if (!this.group) {
			this.group = group;
		} else {
			throw new Error(
				`role ${this.code} has already assigned to another group: ${this.group.getCode()}`,
			);
		}
	}

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

	getCode(): C {
		return this.code;
	}

	getConfig(): T | undefined {
		return this.config;
	}

	getGroup() {
		return this.group;
	}

	getPermissions(type?: string) {
		const rolePermissions = type
			? this.permissions.filter((permission) => permission.getType() === type)
			: this.permissions;
		const groupPermissions = this.group ? this.group.getPermissions(type) : [];

		return [...groupPermissions, ...rolePermissions];
	}

	resetGroup() {
		this.group = undefined;
	}
}
