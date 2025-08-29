import { describe, it, expect } from "vitest";
import { Group, PermissionMessage, Role } from "../../../../src/core";
import {
	MenuAccessAction,
	MenuAccessPermission,
} from "../../../../src/permissions";

describe("MenuAccessPermission class", () => {
	it("should have a type with menu", () => {
		const adminRole = new Role("ADMIN");
		const permission = new MenuAccessPermission(adminRole, []);

		expect(permission.getType()).toBe("menu");
	});
	it("should return error if the action type is not component", () => {
		const adminRole = new Role("ADMIN");
		const permission = new MenuAccessPermission(adminRole, []);
		const action = new MenuAccessAction("ADMIN", {
			identifier: "menuAccessAction",
			menu: [],
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the identifier doesn't match with permission", () => {
		const adminRole = new Role("ADMIN");
		const permission = new MenuAccessPermission(adminRole, [
			{
				identifier: "menuAccessPermission",
				list: [],
			},
		]);
		const action = new MenuAccessAction("ADMIN", {
			identifier: "menuAccessAction",
			menu: [],
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return valid rules based on the action", () => {
		const identifier = "menuAccessPermission";
		const rules = [
			{
				identifier,
				list: [],
			},
		];
		const adminRole = new Role("ADMIN");
		const permission = new MenuAccessPermission(adminRole, rules);
		const action = new MenuAccessAction("ADMIN", {
			identifier,
			menu: [],
		});

		expect(permission.getRulesByAction(action)).toEqual(rules);
	});
	it("should return accessible menu list", () => {
		const identifier = "menuAccessPermission";
		const rules = [
			{
				identifier,
				list: ["a"],
			},
		];
		const adminRole = new Role("ADMIN");
		const permission = new MenuAccessPermission(adminRole, rules);
		const action = new MenuAccessAction("ADMIN", {
			identifier,
			menu: ["a", "b", "c"],
		});

		expect(permission.getAccessibleList(action)).toEqual(["a"]);
	});
	it("should return accessible menu list when the role belongs to a group", () => {
		const identifier = "menuAccessPermission";
		const rules = [
			{
				identifier,
				list: ["a"],
			},
		];
		const adminRole = new Role("ADMIN");
		const group = new Group("MAIN");
		adminRole.assignGroup(group);

		const groupPermission = new MenuAccessPermission(group, rules);
		const action = new MenuAccessAction("ADMIN", {
			identifier,
			menu: ["a", "b", "c"],
		});

		expect(groupPermission.getAccessibleList(action)).toEqual(["a"]);
	});
	it("should return empty array if the exclude flag exist", () => {
		const identifier = "menuAccessPermission";

		const rules = [
			{
				identifier,
				list: ["a"],
				exclude: true,
			},
		];

		const adminRole = new Role("ADMIN");

		const permission = new MenuAccessPermission(adminRole, rules);

		const action = new MenuAccessAction("ADMIN", {
			identifier,
			menu: ["a", "b", "c"],
		});

		expect(permission.getAccessibleList(action)).toEqual([]);
	});
});
