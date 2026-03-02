export type NavLink = {
	label: string;
	href: string;
	icon?: React.ReactNode;
};

export const TOOL_LINKS: NavLink[] = [
	{
		label: "Today's Rankings",
		href: "/rankings",
	},
	{
		label: "Consistency",
		href: "/consistency",
	},
	{
		label: "Schedule",
		href: "/schedule",
	},
];
