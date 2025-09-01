import { describe, it, expect, vi } from "vitest";
import { PermissionMessage, Role } from "../../../../src/core";
import {
	ComponentAccessAction,
	ComponentAccessPermission,
} from "../../../../src/permissions";
import {
	createAccessControl,
	createComponentAccessAction,
	createComponentPermission,
	createGroup,
	createRole,
} from "../../../../src";

describe("ComponentAccessPermission class", () => {
	it("should have a type with navigation", () => {
		const adminRole = new Role("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, []);

		expect(permission.getType()).toBe("component");
	});
	it("should return error if the action type is not component", () => {
		const adminRole = createRole("ADMIN");
		const permission = new ComponentAccessPermission(adminRole, []);
		const action = new ComponentAccessAction("component", {
			action: "view",
			identifier: "componentAccessAction",
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the permission doesn't include view action", () => {
		const adminRole = createRole("ADMIN");
		const permission = createComponentPermission(adminRole, [
			{
				actions: ["edit"],
				identifier: "componentAccessAction",
			},
		]);
		const action = createComponentAccessAction(adminRole.getCode(), {
			action: "view",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the permission doesn't include edit action", () => {
		const adminRole = createRole("ADMIN");
		const permission = createComponentPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
			},
		]);
		const action = createComponentAccessAction(adminRole.getCode(), {
			action: "edit",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should allow edit action", () => {
		const adminRole = createRole("ADMIN");
		const permission = createComponentPermission(adminRole, [
			{
				actions: ["edit"],
				identifier: "componentAccessAction",
			},
		]);
		const action = createComponentAccessAction(adminRole.getCode(), {
			action: "edit",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeUndefined();
	});
	it("should allow view action", () => {
		const adminRole = createRole("ADMIN");
		const permission = createComponentPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
			},
		]);
		const action = createComponentAccessAction(adminRole.getCode(), {
			action: "view",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeUndefined();
	});
	it("should return error if the exclude flag exist", () => {
		const adminRole = createRole("ADMIN");
		const permission = createComponentPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
				exclude: true,
			},
		]);
		const action = createComponentAccessAction(adminRole.getCode(), {
			action: "view",
			identifier: "componentAccessAction",
		});
		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the exclude flag exist in role permission but not in group permission", () => {
		const adminRole = createRole("ADMIN");
		const group = createGroup("MAIN");
		const accessControl = createAccessControl({
			roles: [adminRole],
			groups: [group],
		});

		const rolePermission = createComponentPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
				exclude: true,
			},
		]);

		const groupPermission = createComponentPermission(group, [
			{
				actions: ["view"],
				identifier: "componentAccessAction",
			},
		]);

		group.assignRole(adminRole);

		const action = createComponentAccessAction(adminRole.getCode(), {
			action: "view",
			identifier: "componentAccessAction",
		});

		const mockSuccess = vi.fn();
		const mockFailure = vi.fn();

		accessControl.checkPermissions(action, {
			onSuccess: mockSuccess,
			onFailure: mockFailure,
		});
		expect(mockFailure).toBeCalledWith(
			action,
			rolePermission,
			expect.any(Object),
		);
		expect(mockSuccess).not.toHaveBeenCalled();
	});
});
