import { describe, it, expect, vi } from "vitest";
import {
	RouteAccessAction,
	RouteAccessPermission,
	type IRoutePermissionRule,
} from "../../../../src/permissions";
import {
	AccessControl,
	Group,
	PermissionMessage,
	Role,
} from "../../../../src/core";

describe("RouteAccessAction Class", () => {
	it("should set the type to navigation", () => {
		const action = new RouteAccessAction("ADMIN", { route: "random" });

		expect(action.getType()).toEqual("navigation");
	});
});

describe("RouteAccessPermission Class", () => {
	it("should have a type as navigation", () => {
		const adminRole = new Role("ADMIN");
		const permission = new RouteAccessPermission(adminRole, []);

		expect(permission.getType()).toBe("navigation");
	});
	it("should return the default route via isDefault flag", () => {
		const adminRole = new Role("ADMIN");
		const ruleWithDefaultFlag: IRoutePermissionRule = {
			route: "random",
			isDefault: true,
		};
		const rule: IRoutePermissionRule = { route: "random" };
		const permission = new RouteAccessPermission(adminRole, [
			rule,
			ruleWithDefaultFlag,
		]);

		expect(permission.getDefaultRoute()).toEqual(ruleWithDefaultFlag);
	});
	it("should return error if the action type is not navigation", () => {
		const adminRole = new Role("ADMIN");
		const permission = new RouteAccessPermission(adminRole, []);
		const action = new RouteAccessAction("ADMIN", { route: "random" });

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should call the functions from the middlewares", () => {
		const adminRole = new Role("ADMIN");
		const middlewareMock = vi.fn();
		const permission = new RouteAccessPermission(
			adminRole,
			[],
			[middlewareMock],
		);
		const action = new RouteAccessAction("ADMIN", { route: "random" });

		permission.validate(action);

		expect(middlewareMock).toHaveBeenCalledOnce();
		expect(middlewareMock).toHaveBeenCalledWith(permission, action);
	});
	it("should return error if the exclude flag exist", () => {
		const adminRole = new Role("ADMIN");
		const ruleWithExcludeFlag: IRoutePermissionRule = {
			route: "random",
			exclude: true,
		};
		const rule: IRoutePermissionRule = { route: "random" };
		const permission = new RouteAccessPermission(adminRole, [
			rule,
			ruleWithExcludeFlag,
		]);
		const action = new RouteAccessAction("ADMIN", { route: "random" });

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the exclude flag exist in the group permission", () => {
		const adminRole = new Role("ADMIN");
		const group = new Group("MAIN");
		const accessControl = new AccessControl([adminRole], [group]);

		group.assignRole(adminRole);

		const action = new RouteAccessAction("ADMIN", { route: "random" });

		const mockFailure = vi.fn();
		const mockSuccess = vi.fn();

		accessControl.checkPermissions(action, {
			onSuccess: mockSuccess,
			onFailure: mockFailure,
		});

		expect(mockFailure).toBeCalledWith(action, expect.any(Object));
		expect(mockSuccess).not.toHaveBeenCalled();
	});
});
