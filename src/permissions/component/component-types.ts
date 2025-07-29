export type ComponentAccessActionType = "component";

export type ComponentAccessParametersActions<T = IComponentPermissionRule> =
	T extends IComponentPermissionRule<infer A> ? A : never;

export interface IComponentAccessParameters
	extends Omit<IComponentPermissionRule, "actions"> {
	action: ComponentAccessParametersActions;
	identifier: string;
}

export interface IComponentPermissionRule<A = "edit" | "view"> {
	actions: A[];
	exclude?: boolean;
	identifier: RegExp | string;
}
