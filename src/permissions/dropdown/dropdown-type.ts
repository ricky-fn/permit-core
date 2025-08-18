import type {
	ListAccessActionType,
	ListAccessParameters,
	ListPermissionRule,
} from "../list/list-types";

export type DropdownAccessActionType = "dropdown";

export type IDropdownAccessParameters =
	ListAccessParameters<DropdownAccessActionType>;
export type IDropdownPermissionRule = ListPermissionRule<ListAccessActionType>;
