import { describe, it, expect, vi } from "vitest";
import {
	AccessControl,
	Group,
	PermissionMessage,
	Role,
} from "../../../../src/core";
import {
	ComponentAccessAction,
	ComponentAccessPermission,
} from "../../../../src/permissions";

describe("ComponentAccessPermission class", () => {
	it("should have a type with navigation", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, []);

		expect(permission.getType()).toBe("component");
	});
	it("should return error if the action type is not component", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, []);
		const action = new ComponentAccessAction("component", {
			action: "view",
			identifier: "componentAccessAction",
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the permission doesn't include view action", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, [
			{
				actions: ["edit"],
				identifier: "componentAccessAction",
			},
		]);
		const action = new ComponentAccessAction("ADMIN", {
			action: "view",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the permission doesn't include edit action", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
			},
		]);
		const action = new ComponentAccessAction("ADMIN", {
			action: "edit",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should allow edit action", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, [
			{
				actions: ["edit"],
				identifier: "componentAccessAction",
			},
		]);
		const action = new ComponentAccessAction("ADMIN", {
			action: "edit",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeUndefined();
	});
	it("should allow view action", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
			},
		]);
		const action = new ComponentAccessAction("ADMIN", {
			action: "view",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeUndefined();
	});
	it("should return error if the exclude flag exist", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
				exclude: true,
			},
		]);
		const action = new ComponentAccessAction("ADMIN", {
			action: "view",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the exclude flag exist in group permission", () => {
		const adminRole = new Role("ADMIN");
		const group = new Group("MAIN");
		const accessControl = new AccessControl([adminRole], [group]);

		group.assignRole(adminRole);

		const action = new ComponentAccessAction("ADMIN", {
			action: "view",
			identifier: "componentAccessAction",
		});

		const mockSuccess = vi.fn();
		const mockFailure = vi.fn();

		accessControl.checkPermissions(action, {
			onSuccess: mockSuccess,
			onFailure: mockFailure,
		});
		expect(mockFailure).toBeCalledWith(action, expect.any(Object));
		expect(mockSuccess).not.toHaveBeenCalled();
	});
});
