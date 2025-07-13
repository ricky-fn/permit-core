import type {
	ListAccessActionType,
	ListAccessParameters,
} from "../list/list-types";

export type DropdownAccessActionType = "dropdown";

export type IDropdownAccessParameters =
	ListAccessParameters<DropdownAccessActionType>;
export type IDropdownPermissionRule =
	ListAccessParameters<ListAccessActionType>;
