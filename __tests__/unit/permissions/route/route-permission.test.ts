import { describe, it, expect, vi } from "vitest";
import { PermissionMessage } from "../../../../src/core";
import type { IRoutePermissionRule } from "../../../../src/permissions";
import {
	createAccessControl,
	createGroup,
	createRole,
	createRouteAccessAction,
	createRoutePermission,
} from "../../../../src";

describe("RouteAccessAction Class", () => {
	it("should set the type to navigation", () => {
		const action = createRouteAccessAction("ADMIN", { route: "random" });

		expect(action.getType()).toEqual("navigation");
	});
});

describe("RouteAccessPermission Class", () => {
	it("should have a type as navigation", () => {
		const adminRole = createRole("ADMIN");
		const permission = createRoutePermission(adminRole, []);

		expect(permission.getType()).toBe("navigation");
	});
	it("should return the default route via isDefault flag", () => {
		const adminRole = createRole("ADMIN");
		const ruleWithDefaultFlag: IRoutePermissionRule = {
			route: "random",
			isDefault: true,
		};
		const rule: IRoutePermissionRule = { route: "random" };
		const permission = createRoutePermission(adminRole, [
			rule,
			ruleWithDefaultFlag,
		]);

		expect(permission.getDefaultRoute()).toEqual(ruleWithDefaultFlag);
	});
	it("should return error if the action type is not navigation", () => {
		const adminRole = createRole("ADMIN");
		const permission = createRoutePermission(adminRole, []);
		const action = createRouteAccessAction(adminRole.getCode(), {
			route: "random",
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should call the functions from the middlewares", () => {
		const adminRole = createRole("ADMIN");
		const middlewareMock = vi.fn();
		const permission = createRoutePermission(adminRole, [], [middlewareMock]);
		const action = createRouteAccessAction(adminRole.getCode(), {
			route: "random",
		});

		permission.validate(action);

		expect(middlewareMock).toHaveBeenCalledOnce();
		expect(middlewareMock).toHaveBeenCalledWith(permission, action);
	});
	it("should return error if the exclude flag exist", () => {
		const adminRole = createRole("ADMIN");
		const ruleWithExcludeFlag: IRoutePermissionRule = {
			route: "random",
			exclude: true,
		};
		const rule: IRoutePermissionRule = { route: "random" };
		const permission = createRoutePermission(adminRole, [
			rule,
			ruleWithExcludeFlag,
		]);
		const action = createRouteAccessAction(adminRole.getCode(), {
			route: "random",
		});

		expect(permission.validate(action)).toBeInstanceOf(PermissionMessage);
	});
	it("should return error if the exclude flag exist in the role permission but not in the group permission", () => {
		const adminRole = createRole("ADMIN");
		const group = createGroup("MAIN");
		const accessControl = createAccessControl({
			roles: [adminRole],
			groups: [group],
		});

		createRoutePermission(adminRole, [{ route: "random", exclude: true }]);

		createRoutePermission(group, [{ route: "random" }]);

		group.assignRole(adminRole);

		const action = createRouteAccessAction(adminRole.getCode(), {
			route: "random",
		});

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
