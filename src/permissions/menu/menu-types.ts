import type {
	ListAccessActionType,
	ListAccessParameters,
} from "../list/list-types";

export type MenuAccessActionType = "menu";

export type IMenuAccessParameters = ListAccessParameters<MenuAccessActionType>;
export type IMenuPermissionRule = ListAccessParameters<ListAccessActionType>;
