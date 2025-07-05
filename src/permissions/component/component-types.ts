export type ComponentAccessParametersActions<T = IComponentPermissionRule> =
  T extends IComponentPermissionRule<infer A> ? A : never;

export type IComponentPermissionRule<A = "view" | "edit"> = {
  actions: A[];
  identifier: string | RegExp;
  exclude?: boolean;
};

export type ComponentAccessActionType = "component";

export interface IComponentAccessParameters
  extends Omit<IComponentPermissionRule, "actions"> {
  action: ComponentAccessParametersActions;
  identifier: string;
}
