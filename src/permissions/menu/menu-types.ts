export type MenuPermissionRule = {
  menuList: string[] | RegExp;
  identifier: string | RegExp;
  exclude?: boolean;
};

export type MenuAccessActionType = "menu";

export interface IMenuAccessParameters {
  identifier: string;
  menuList: string[];
}
