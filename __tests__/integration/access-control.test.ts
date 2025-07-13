// tests/integration/access-control.test.ts
import { describe, it, expect, vi } from "vitest";
import {
	createAccessControl,
	createComponentAction,
	createComponentPermission,
	createDropdownAccessAction,
	createDropdownPermission,
	createMenuAccessAction,
	createMenuPermission,
	createRole,
	createRouteAccessAction,
	createRoutePermission,
} from "../../src";

describe("AccessControl Integration", () => {
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
});
