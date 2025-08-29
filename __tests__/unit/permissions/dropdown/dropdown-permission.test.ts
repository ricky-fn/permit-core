import { describe, it, expect } from "vitest";
import { Group, PermissionMessage, Role } from "../../../../src/core";
import {
	DropdownAccessAction,
	DropdownAccessPermission,
} from "../../../../src/permissions";

describe("DropdownAccessPermission class", () => {
	it("should have a type with dropdown", () => {
		const adminRole = new Role("ADMIN");
		const permission = new DropdownAccessPermission(adminRole, []);

		expect(permission.getType()).toBe("dropdown");
	});
	it("should return error if the action type is not component", () => {
		const adminRole = new Role("ADMIN");
		const permission = new DropdownAccessPermission(adminRole, []);
		const action = new DropdownAccessAction("ADMIN", {
			identifier: "dropdownAccessAction",
			dropdown: [],
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the identifier doesn't match with permission", () => {
		const adminRole = new Role("ADMIN");
		const permission = new DropdownAccessPermission(adminRole, [
			{
				identifier: "dropdownAccessPermission",
				list: [],
			},
		]);
		const action = new DropdownAccessAction("ADMIN", {
			identifier: "dropdownAccessAction",
			dropdown: [],
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return valid rules based on the action", () => {
		const identifier = "dropdownAccessPermission";
		const rules = [
			{
				identifier,
				list: [],
			},
		];
		const adminRole = new Role("ADMIN");
		const permission = new DropdownAccessPermission(adminRole, rules);
		const action = new DropdownAccessAction("ADMIN", {
			identifier,
			dropdown: [],
		});

		expect(permission.getRulesByAction(action)).toEqual(rules);
	});
	it("should return accessible menu list", () => {
		const identifier = "dropdownAccessPermission";
		const rules = [
			{
				identifier,
				list: ["a"],
			},
		];
		const adminRole = new Role("ADMIN");
		const permission = new DropdownAccessPermission(adminRole, rules);
		const action = new DropdownAccessAction("ADMIN", {
			identifier,
			dropdown: ["a", "b", "c"],
		});

		expect(permission.getAccessibleList(action)).toEqual(["a"]);
	});
	it("should return accessible menu list when the role belongs to a group", () => {
		const identifier = "dropdownAccessPermission";
		const rules = [
			{
				identifier,
				list: ["a"],
			},
		];
		const adminRole = new Role("ADMIN");
		const group = new Group("MAIN");
		adminRole.assignGroup(group);

		const groupPermission = new DropdownAccessPermission(group, rules);
		const action = new DropdownAccessAction("ADMIN", {
			identifier,
			dropdown: ["a", "b", "c"],
		});

		expect(groupPermission.getAccessibleList(action)).toEqual(["a"]);
	});
	it("should return empty array if the exclude flag exist", () => {
		const identifier = "dropdownAccessPermission";

		const rules = [
			{
				identifier,
				list: ["a"],
				exclude: true,
			},
		];

		const adminRole = new Role("ADMIN");

		const permission = new DropdownAccessPermission(adminRole, rules);

		const action = new DropdownAccessAction("ADMIN", {
			identifier,
			dropdown: ["a", "b", "c"],
		});

		expect(permission.getAccessibleList(action)).toEqual([]);
	});
	it("should return empty array if the exclude flag exist in the role permission but not in the group permission", () => {
		const identifier = "dropdownAccessPermission";

		const adminRole = new Role("ADMIN");
		const group = new Group("MAIN");

		const groupPermission = new DropdownAccessPermission(group, [
			{
				identifier,
				list: ["a"],
			},
		]);

		const rolePermission = new DropdownAccessPermission(adminRole, [
			{
				identifier,
				list: ["a"],
				exclude: true,
			},
		]);

		adminRole.assignGroup(group);

		const action = new DropdownAccessAction(adminRole.getCode(), {
			identifier,
			dropdown: ["a"],
		});

		expect(rolePermission.getAccessibleList(action)).toEqual([]);
	});
	it("should return empty array if the exclude flag exist in the role permission and the identifier is regex", () => {
		const identifier = "dropdownAccessPermission";
		const adminRole = new Role("ADMIN");

		const rolePermission = new DropdownAccessPermission(adminRole, [
			{
				identifier,
				list: /.*/,
				exclude: true,
			},
		]);

		const action = new DropdownAccessAction(adminRole.getCode(), {
			identifier,
			dropdown: ["a", "b", "c"],
		});

		expect(rolePermission.getAccessibleList(action)).toEqual([]);
	});
	it("should return mixed accessible list", () => {
		const identifier = "dropdownAccessPermission";
		const group = new Group("MAIN");
		const adminRole = new Role("ADMIN");

		const rolePermission = new DropdownAccessPermission(adminRole, [
			{
				identifier,
				list: ["a"],
			},
		]);

		const groupPermission = new DropdownAccessPermission(group, [
			{
				identifier,
				list: ["b"],
			},
		]);

		adminRole.assignGroup(group);

		const action = new DropdownAccessAction(adminRole.getCode(), {
			identifier,
			dropdown: ["a", "b", "c"],
		});

		expect(rolePermission.getAccessibleList(action)).toEqual(["b", "a"]);
	});
	it("should return mixed accessible list with exclude flag", () => {
		const identifier = "dropdownAccessPermission";
		const group = new Group("MAIN");
		const adminRole = new Role("ADMIN");

		const rolePermission = new DropdownAccessPermission(adminRole, [
			{
				identifier,
				list: ["b"],
				exclude: true,
			},
		]);

		const groupPermission = new DropdownAccessPermission(group, [
			{
				identifier,
				list: ["b", "c"],
			},
		]);

		adminRole.assignGroup(group);

		const action = new DropdownAccessAction(adminRole.getCode(), {
			identifier,
			dropdown: ["a", "b", "c"],
		});

		expect(rolePermission.getAccessibleList(action)).toEqual(["c"]);
	});
});
