import { IPermissionMessage } from "./permission-message.js";

export class Role<C = string, T = unknown> {
  private permissions: Permission[] = [];
  private group?: Group;
  constructor(
    protected code: C,
    protected config?: T,
  ) {}

  getCode(): C {
    return this.code;
  }

  getConfig(): void | T {
    return this.config;
  }

  getGroup() {
    return this.group;
  }

  assignGroup(group: Group) {
    if (!this.group) {
      this.group = group;
    } else {
      throw new Error(
        `role ${this.code} has already assigned to another group: ${this.group.getCode()}`,
      );
    }
  }

  getPermissions(type?: string) {
    const rolePermissions = type
      ? this.permissions.filter((permission) => permission.getType() === type)
      : this.permissions;
    const groupPermissions = this.group ? this.group.getPermissions(type) : [];

    return [...groupPermissions, ...rolePermissions];
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

  resetGroup() {
    this.group = undefined;
  }
}

export class Group<C extends string = string> {
  private permissions: Permission[] = [];
  private roles: Role[] = [];
  constructor(protected code: C) {}
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
  getRoles(): Role[] {
    return this.roles;
  }
  getPermissions(type?: string) {
    return type
      ? this.permissions.filter((permission) => permission.getType() === type)
      : this.permissions;
  }
  getCode() {
    return this.code;
  }
  excludeRole(role: Role) {
    this.roles = this.roles.filter((_role) => _role !== role);
  }
}

interface IPermissionCallbacks<A> {
  onSuccess: (action: A) => void;
  onFailure?: (action: A, message: IPermissionMessage) => void;
}

export abstract class Permission<T = string, R = unknown> {
  constructor(
    protected target: Role | Group,
    protected type: T,
    protected rules: R[],
  ) {
    target.assignPermission(this as unknown as Permission);
  }

  addRule(rule: R): this {
    if (this.rules instanceof Array) this.rules.push(rule);
    return this;
  }

  getTarget() {
    return this.target;
  }

  getType(): T {
    return this.type;
  }

  getRules(): R[] {
    return this.rules;
  }

  abstract validate(action: Action): IPermissionMessage | void;
}

export class Action<T = string, P = object> {
  constructor(
    protected roleCode: string,
    protected type: T,
    protected parameters: P,
  ) {}

  getRoleCode(): string {
    return this.roleCode;
  }

  getType(): T {
    return this.type;
  }

  getParameters(): P {
    return this.parameters;
  }
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
    if (this.roles.indexOf(role) === -1) {
      this.roles.push(role);
    }
  }
  checkPermissions<A extends Action>(
    action: A,
    callbacks: IPermissionCallbacks<A>,
  ): void {
    const roleCode = action.getRoleCode();
    const role = this.getRoleByCode(roleCode);

    if (!role && callbacks.onFailure)
      return callbacks.onFailure(action, {
        status: "failed",
        message: "Role not found.",
        action,
      });

    const matchingPermissions = role.getPermissions(action.getType());

    if (matchingPermissions.length === 0 && callbacks.onFailure)
      return callbacks.onFailure(action, {
        status: "failed",
        message: "No matching permissions found.",
        target: role,
        action,
      });

    for (const permission of matchingPermissions) {
      const result = permission.validate(action);
      if (
        result instanceof PermissionMessage &&
        result.status === "failed" &&
        callbacks.onFailure
      ) {
        return callbacks.onFailure(action, result);
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
