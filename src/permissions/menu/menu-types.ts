import type {
	ListAccessActionType,
	ListAccessParameters,
	ListPermissionRule,
} from "../list/list-types";

export type MenuAccessActionType = "menu";

export type IMenuAccessParameters = ListAccessParameters<MenuAccessActionType>;
export type IMenuPermissionRule = ListPermissionRule<ListAccessActionType>;
