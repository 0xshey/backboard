export type NavLink = {
	label: string;
	href: string;
	icon?: React.ReactNode;
	children?: NavLink[];
};

export const RANKINGS_LINKS: NavLink[] = [
	{ label: "Points", href: "/rankings/points" },
	{ label: "Dynasty", href: "/rankings/dynasty" },
	{ label: "Categories", href: "/rankings/categories" },
];

export const TOOL_LINKS: NavLink[] = [
	{
		label: "Schedule",
		href: "/schedule",
	},
	{
		label: "Rankings",
		href: "/rankings/points",
		children: RANKINGS_LINKS,
	},
];
