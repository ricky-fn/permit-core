export type RouteAccessActionType = "navigation";

export interface IRouteAccessParameters {
  route: string;
}

export type IRoutePermissionRule = {
  route: string | RegExp;
  isDefault?: boolean;
  exclude?: boolean;
};
