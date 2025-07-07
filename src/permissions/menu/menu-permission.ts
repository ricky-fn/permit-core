import { Action, Permission, Group, Role, PermissionMessage } from "../../core";
import { findSharedMembers, mergeArrays } from "../../utilities";
import {
  MenuPermissionRule,
  MenuAccessActionType,
  IMenuAccessParameters,
} from "./menu-types";

export class MenuAccessAction extends Action<
  MenuAccessActionType,
  IMenuAccessParameters
> {
  constructor(
    protected roleCode: string,
    protected parameters: IMenuAccessParameters,
  ) {
    super(roleCode, "menu", parameters);
  }
}

export class MenuAccessPermission extends Permission<
  MenuAccessActionType,
  MenuPermissionRule
> {
  constructor(
    protected target: Role | Group,
    protected rules: MenuPermissionRule[],
  ) {
    super(target, "menu", rules);
  }
  validate(action: MenuAccessAction) {
    if (action.getType() !== this.type)
      return new PermissionMessage({
        status: "failed",
        message: "action type doesn't match the permission type",
        target: this.target,
        action,
      });

    const matchedRules = this.getRulesByAction(action);

    if (matchedRules.length === 0) {
      return new PermissionMessage({
        status: "failed",
        message: `No access permission for menu '${action.getParameters().identifier}'`,
        target: this.target,
        action,
      });
    }
  }
  getRulesByAction(action: MenuAccessAction) {
    const accessIdentifier = action.getParameters().identifier;
    const validRules: MenuPermissionRule[] = [];

    for (const rule of this.rules) {
      let identifierMatchedRule: MenuPermissionRule | undefined = undefined;
      if (
        rule.identifier instanceof RegExp &&
        rule.identifier.test(accessIdentifier)
      ) {
        identifierMatchedRule = rule;
      } else if (rule.identifier === accessIdentifier) {
        identifierMatchedRule = rule;
      }

      if (identifierMatchedRule) {
        validRules.push(identifierMatchedRule);
      }
    }

    return validRules;
  }
  getAccessibleMenuList(action: MenuAccessAction) {
    let accessibleMenuList: string[] = [];
    const requestedMenuList: string[] = action.getParameters().menuList;

    if (this.target instanceof Group) {
      const rules: MenuPermissionRule[] = this.getRulesByAction(action);

      rules.forEach((rule) => {
        requestedMenuList.forEach((requestMenu) => {
          if (
            (rule.menuList instanceof RegExp &&
              rule.menuList.test(requestMenu)) ||
            (rule.menuList instanceof Array &&
              rule.menuList.includes(requestMenu))
          ) {
            if (!rule.exclude) {
              accessibleMenuList.push(requestMenu);
            } else {
              accessibleMenuList = accessibleMenuList.filter((menu) => {
                return (
                  (rule.menuList instanceof RegExp &&
                    !rule.menuList.test(menu)) ||
                  (rule.menuList instanceof Array &&
                    !rule.menuList.includes(menu))
                );
              });
            }
          }
        });
      });
    }

    if (this.target instanceof Role) {
      const rules: MenuPermissionRule[] = this.getRulesByAction(action);
      let roleAccessibleMenuList: string[] = [];
      rules.forEach((rule) => {
        requestedMenuList.forEach((requestMenu) => {
          if (
            (rule.menuList instanceof RegExp &&
              rule.menuList.test(requestMenu)) ||
            (rule.menuList instanceof Array &&
              rule.menuList.includes(requestMenu))
          ) {
            if (!rule.exclude) {
              roleAccessibleMenuList.push(requestMenu);
            } else {
              roleAccessibleMenuList = roleAccessibleMenuList.filter((menu) => {
                return (
                  (rule.menuList instanceof RegExp &&
                    !rule.menuList.test(menu)) ||
                  (rule.menuList instanceof Array &&
                    !rule.menuList.includes(menu))
                );
              });
            }
          }
        });
      });

      const group = this.target.getGroup();
      if (group) {
        const menuAccessPermissions = group.getPermissions(
          "menu",
        ) as MenuAccessPermission[];

        if (menuAccessPermissions.length > 0) {
          menuAccessPermissions.forEach((permission) => {
            accessibleMenuList = mergeArrays(
              accessibleMenuList,
              permission.getAccessibleMenuList(action),
            );
          });
        }

        return findSharedMembers(accessibleMenuList, roleAccessibleMenuList);
      }

      return roleAccessibleMenuList;
    }

    return accessibleMenuList;
  }
}
