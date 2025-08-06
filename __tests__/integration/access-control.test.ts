// tests/integration/access-control.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	createAccessControl,
	createComponentAction,
	createComponentPermission,
	createDropdownAccessAction,
	createDropdownPermission,
	createGroup,
	createMenuAccessAction,
	createMenuPermission,
	createRole,
	createRouteAccessAction,
	createRoutePermission,
} from "../../src";

describe("AccessControl Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should handle combined permissions", () => {
		const adminRole = createRole("ADMIN");

		const accessControl = createAccessControl({ roles: [adminRole] });

		createRoutePermission(adminRole, [
			{
				route: "/dashboard",
			},
		]);

		createComponentPermission(adminRole, [
			{
				actions: ["view"],
				identifier: "dashboard",
			},
		]);

		createDropdownPermission(adminRole, [
			{
				identifier: "dropdown",
				list: ["a", "b", "c"],
			},
		]);

		createMenuPermission(adminRole, [
			{
				identifier: "menu",
				list: ["a", "b", "c"],
			},
		]);

		const routeAction = createRouteAccessAction(adminRole.getCode(), {
			route: "/dashboard",
		});
		const compAction = createComponentAction(adminRole.getCode(), {
			action: "view",
			identifier: "dashboard",
		});
		const dropdownAction = createDropdownAccessAction(adminRole.getCode(), {
			identifier: "dropdown",
			dropdown: ["a", "b", "c"],
		});
		const menuAction = createMenuAccessAction(adminRole.getCode(), {
			identifier: "menu",
			menu: ["a", "b", "c"],
		});

		const routeSuccess = vi.fn();
		const compSuccess = vi.fn();
		const dropdownSuccess = vi.fn();
		const menuSuccess = vi.fn();

		accessControl.checkPermissions(routeAction, { onSuccess: routeSuccess });
		accessControl.checkPermissions(compAction, { onSuccess: compSuccess });
		accessControl.checkPermissions(dropdownAction, {
			onSuccess: dropdownSuccess,
		});
		accessControl.checkPermissions(menuAction, { onSuccess: menuSuccess });

		expect(routeSuccess).toHaveBeenCalled();
		expect(compSuccess).toHaveBeenCalled();
		expect(dropdownSuccess).toHaveBeenCalled();
		expect(menuSuccess).toHaveBeenCalled();
	});

	it("should handle combined permissions with inheritance", () => {
		const adminRole = createRole("ADMIN");
		const group = createGroup("GROUP");

		const accessControl = createAccessControl({ roles: [adminRole] });

		createRoutePermission(group, [
			{
				route: "/dashboard",
			},
		]);

		adminRole.assignGroup(group);

		const routeAction = createRouteAccessAction(adminRole.getCode(), {
			route: "/dashboard",
		});

		const routeSuccess = vi.fn();
		const routeFailure = vi.fn();
		accessControl.checkPermissions(routeAction, {
			onSuccess: routeSuccess,
			onFailure: routeFailure,
		});

		expect(routeSuccess).toHaveBeenCalled();
		expect(routeFailure).not.toHaveBeenCalled();
	});

	it("should reject access if the group has access but the user has no access", () => {
		const adminRole = createRole("ADMIN");
		const group = createGroup("GROUP");

		const accessControl = createAccessControl({ roles: [adminRole] });

		createRoutePermission(group, [
			{
				route: "/dashboard",
			},
		]);

		adminRole.assignGroup(group);

		createRoutePermission(adminRole, [
			{
				route: "/dashboard",
				exclude: true,
			},
		]);

		const routeAction = createRouteAccessAction(adminRole.getCode(), {
			route: "/dashboard",
		});

		const routeSuccess = vi.fn();
		const routeFailure = vi.fn();

		accessControl.checkPermissions(routeAction, {
			onSuccess: routeSuccess,
			onFailure: routeFailure,
		});

		expect(routeSuccess).not.toHaveBeenCalled();
		expect(routeFailure).toHaveBeenCalled();
	});

	it("should reject access if the group has no access but the user has access", () => {
		const adminRole = createRole("ADMIN");
		const group = createGroup("GROUP");

		const accessControl = createAccessControl({ roles: [adminRole] });

		createRoutePermission(group, [
			{
				route: "/dashboard",
				exclude: true,
			},
		]);

		adminRole.assignGroup(group);

		createRoutePermission(adminRole, [
			{
				route: "/dashboard",
			},
		]);

		const routeAction = createRouteAccessAction(adminRole.getCode(), {
			route: "/dashboard",
		});

		const routeSuccess = vi.fn();
		const routeFailure = vi.fn();

		accessControl.checkPermissions(routeAction, {
			onSuccess: routeSuccess,
			onFailure: routeFailure,
		});

		expect(routeSuccess).not.toHaveBeenCalled();
		expect(routeFailure).toHaveBeenCalled();
	});

	it("should reject access when group A inherits from group B and group B has no access", () => {
		const adminRole = createRole("ADMIN");
		const groupA = createGroup("GROUP_A");

		createRoutePermission(groupA, [
			{
				route: "/dashboard",
			},
		]);

		const groupB = createGroup("GROUP_B", groupA);

		createRoutePermission(groupB, [
			{
				route: "/dashboard",
				exclude: true,
			},
		]);

		adminRole.assignGroup(groupB);

		const accessControl = createAccessControl({ roles: [adminRole] });

		const routeAction = createRouteAccessAction(adminRole.getCode(), {
			route: "/dashboard",
		});

		const routeSuccess = vi.fn();
		const routeFailure = vi.fn();

		accessControl.checkPermissions(routeAction, {
			onSuccess: routeSuccess,
			onFailure: routeFailure,
		});

		expect(routeSuccess).not.toHaveBeenCalled();
		expect(routeFailure).toHaveBeenCalled();
	});
});
