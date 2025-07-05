// tests/integration/access-control.test.ts
import { describe, it, expect, vi } from "vitest";
import { AccessControl, Role } from "../../src/core";
import {
  ComponentAccessAction,
  RouteAccessAction,
} from "../../src/permissions";

describe("AccessControl Integration", () => {
  it("should handle combined permissions", () => {
    const adminRole = new Role("ADMIN");

    const accessControl = new AccessControl([adminRole]);

    const routeAction = new RouteAccessAction("ADMIN", { route: "/dashboard" });
    const compAction = new ComponentAccessAction("ADMIN", {
      action: "view",
      identifier: "dashboard",
    });

    const routeSuccess = vi.fn();
    const compSuccess = vi.fn();

    accessControl.checkPermissions(routeAction, { onSuccess: routeSuccess });
    accessControl.checkPermissions(compAction, { onSuccess: compSuccess });

    expect(routeSuccess).toHaveBeenCalled();
    expect(compSuccess).toHaveBeenCalled();
  });
});
