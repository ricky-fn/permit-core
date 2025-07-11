export type ListAccessActionType = "list";

export type ListAccessParameters<L extends string> = Record<L, string[]> & {
	identifier: string;
};

export type ListPermissionRule<L extends string> = Record<
	L,
	RegExp | string[]
> & {
	exclude?: boolean;
	identifier: RegExp | string;
};
