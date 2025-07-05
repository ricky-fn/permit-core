import { ComponentAccessPermission } from "../permissions/component/component-permission.js";
import { MenuAccessPermission } from "../permissions/menu/menu-permission.js";
import { RouteAccessPermission } from "../permissions/route/route-permission.js";

export type RolePermissions = {
  navigation: RouteAccessPermission;
  component: ComponentAccessPermission;
  menu: MenuAccessPermission;
};
export type GroupPermissions = Partial<RolePermissions>;
export type RolePermissionGroup<R extends string> = Record<R, RolePermissions>;
export type GroupPermissionGroup<G extends string> = Record<
  G,
  GroupPermissions
>;
