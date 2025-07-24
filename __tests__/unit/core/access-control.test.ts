import { Role, Permission, Group } from "../../../src/core";
import { describe, it, expect } from "vitest";
import { ComponentAccessPermission } from "../../../src/permissions";

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
		const typeOnePermission = new ComponentAccessPermission(role, [
			{
				actions: ["edit", "view"],
				identifier: "one",
			},
		]);
		const typeTwoPermission = new ComponentAccessPermission(role, [
			{
				actions: ["edit", "view"],
				identifier: "two",
			},
		]);

		expect(role.getPermissions("component")).toHaveLength(2);
		expect(role.getPermissions("component")).includes(typeOnePermission);
		expect(role.getPermissions("component")).includes(typeTwoPermission);
	});

	it("should not allow the duplicated permission assignment", () => {
		const role = new Role("ADMIN");
		const rolePermission = new ComponentAccessPermission(role, [
			{
				actions: ["edit", "view"],
				identifier: "one",
			},
		]);

		role.assignPermission(rolePermission);
		role.assignPermission(rolePermission);

		expect(role.getPermissions("component")).toHaveLength(1);

		const group = new Group("MAIN");
		const groupPermission = new ComponentAccessPermission(group, [
			{
				actions: ["edit", "view"],
				identifier: "one",
			},
		]);

		role.assignGroup(group);
		role.assignPermission(groupPermission);

		expect(role.getPermissions("component")).toHaveLength(2);
	});

	it("should return the permissions including the permissions from group", () => {
		const group = new Group("MAIN");
		const role = new Role("ADMIN");

		role.assignGroup(group);

		const groupPermission = new ComponentAccessPermission(group, [
			{
				actions: ["edit", "view"],
				identifier: "one",
			},
		]);
		const rolePermission = new ComponentAccessPermission(role, [
			{
				actions: ["edit", "view"],
				identifier: "one",
			},
		]);

		expect(role.getPermissions("component")).toHaveLength(2);
		expect(role.getPermissions("component")).includes(groupPermission);
		expect(role.getPermissions("component")).includes(rolePermission);
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

		const permission = new ComponentAccessPermission(group, [
			{
				actions: ["edit", "view"],
				identifier: "one",
			},
		]);

		expect(group.getPermissions("component")).toHaveLength(1);
		expect(group.getPermissions("component")).includes(permission);
	});

	it("should retrieve permissions based on type", () => {
		const group = new Group("MAIN");
		new ComponentAccessPermission(group, [
			{
				actions: ["edit", "view"],
				identifier: "one",
			},
		]);

		expect(group.getPermissions("none-exist")).toHaveLength(0);
	});

	it("should correctly assign role", () => {
		const group = new Group("MAIN");
		const role = new Role("ADMIN");

		group.assignRole(role);

		expect(group.getRoles()).toHaveLength(1);
		expect(role.getGroup()).toEqual(group);
	});

	it("should inherit permissions from another group", () => {
		const groupA = new Group("GROUP_A");

		const roleA = new Role("ROLE_A");
		const roleB = new Role("ROLE_B");

		const permissionA = new ComponentAccessPermission(groupA, []);

		const groupB = new Group("GROUP_B");
		const permissionB = new ComponentAccessPermission(groupB, []);

		groupA.assignRole(roleA);
		groupB.assignRole(roleB);
		groupA.assignPermission(permissionA);
		groupB.assignPermission(permissionB);

		expect(
			groupA
				.getPermissions("component")
				.map((permission) => permission.getRules()),
		).toEqual(
			groupB
				.getPermissions("component")
				.map((permission) => permission.getRules()),
		);
		expect(
			roleA
				.getPermissions("component")
				.map((permission) => permission.getRules()),
		).toEqual(
			roleB
				.getPermissions("component")
				.map((permission) => permission.getRules()),
		);
	});
});
