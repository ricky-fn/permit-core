import { Role, Permission, Group } from "../../../src/core";
import { describe, it, expect } from "vitest";

class TestPermission extends Permission<string, unknown> {
  constructor(
    protected target: Role | Group,
    protected type: string,
    protected rules: unknown[],
  ) {
    super(target, type, rules);
  }
  validate() {
    return;
  }
}

describe("Role class", () => {
  it("should return correct role code", () => {
    const role = new Role("ADMIN");
    expect(role.getCode()).toBe("ADMIN");
  });

  it("should return the correct config", () => {
    const config = {};
    const role = new Role("ADMIN", config);

    expect(role.getConfig()).toBe(config);
  });

  it("should return the correct group", () => {
    const group = new Group("MAIN");
    const role = new Role("ADMIN");

    role.assignGroup(group);

    expect(role.getGroup()).toBe(group);
  });

  it("should return the correct permission", () => {
    const role = new Role("ADMIN");
    const typeOnePermission = new TestPermission(role, "one", []);
    const typeTwoPermission = new TestPermission(role, "two", []);

    expect(role.getPermissions("one")).toHaveLength(1);
    expect(role.getPermissions("one")[0]).toEqual(typeOnePermission);

    expect(role.getPermissions("two")).toHaveLength(1);
    expect(role.getPermissions("two")[0]).toEqual(typeTwoPermission);
  });

  it("should not allow the duplicated permission assignment", () => {
    const role = new Role("ADMIN");
    const rolePermission = new TestPermission(role, "test", []);

    role.assignPermission(rolePermission);
    role.assignPermission(rolePermission);

    expect(role.getPermissions("test")).toHaveLength(1);

    const group = new Group("MAIN");
    const groupPermission = new TestPermission(group, "test", []);

    role.assignGroup(group);
    role.assignPermission(groupPermission);

    expect(role.getPermissions("test")).toHaveLength(2);
  });

  it("should return the permissions including the permissions from group", () => {
    const group = new Group("MAIN");
    const role = new Role("ADMIN");

    role.assignGroup(group);

    const groupPermission = new TestPermission(role, "test", []);
    const rolePermission = new TestPermission(role, "test", []);

    expect(role.getPermissions("test")).toHaveLength(2);
    expect(role.getPermissions("test")).includes(groupPermission);
    expect(role.getPermissions("test")).includes(rolePermission);
  });

  it("should throw an error if a role is already assigned to a group", () => {
    const groupA = new Group("A");
    const groupB = new Group("B");
    const role = new Role("ADMIN");

    role.assignGroup(groupA);

    try {
      role.assignGroup(groupB);

      expect(true).toBe(false);
    } catch (e) {
      expect((e as Error).message).toBe(
        `role ADMIN has already assigned to another group: A`,
      );
    }
  });
});

describe("Group Class", () => {
  it("should correctly assign permission", () => {
    const group = new Group("MAIN");
    new TestPermission(group, "test", []);

    expect(group.getPermissions()).toHaveLength(1);
  });

  it("should retrieve permissions based on type", () => {
    const group = new Group("MAIN");
    new TestPermission(group, "test", []);

    expect(group.getPermissions("none-exist")).toHaveLength(0);
  });

  it("should correctly assign role", () => {
    const group = new Group("MAIN");
    const role = new Role("ADMIN");

    group.assignRole(role);

    expect(group.getRoles()).toHaveLength(1);
    expect(role.getGroup()).toEqual(group);
  });

  it("should inherit permissions and roles from another group", () => {
    const groupA = new Group("GROUP_A");
    const groupB = new Group("GROUP_B");

    const roleA = new Role("ROLE_A");
    const roleB = new Role("ROLE_B");

    const permissionA = new TestPermission(groupA, "test", []);
    const permissionB = new TestPermission(groupA, "test", []);

    groupA.assignRole(roleA);
    groupA.assignRole(roleB);
    groupA.assignPermission(permissionA);
    groupA.assignPermission(permissionB);

    groupB.inheritFrom(groupA);

    expect(groupB.getRoles()).toHaveLength(2);
    expect(groupB.getPermissions()).toHaveLength(2);
    expect(groupB.getRoles()).toEqual([roleA, roleB]);
    expect(groupB.getPermissions()).toEqual([permissionA, permissionB]);
  });
});
