import Link from "next/link";
import {
	MenuIcon,
	SearchIcon,
	CalendarDaysIcon,
	TrophyIcon,
	ListOrder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlayerSearch } from "../player-search";

interface NavigationBarProps {
	signedIn: boolean;
	user: any | null;
	signOutAction?: () => Promise<void>;
}

export function NavigationBar({
	signedIn,
	user,
	signOutAction,
}: NavigationBarProps) {
	const links = [
		{
			href: "/schedule",
			label: "Schedule",
			description:
				"View each gameweek’s matchups synced with Yahoo Fantasy.",
			icon: CalendarDaysIcon,
		},
		{
			href: "/fantasy",
			label: "Fantasy",
			description: "Manage and track your fantasy teams in one place.",
			icon: TrophyIcon,
		},
		{
			href: "/rankings",
			label: "Rankings",
			description:
				"View daily and season player rankings for fantasy formats.",
			icon: ListOrder,
		},
	];

	return (
		<header className="bg-background sticky top-0 z-50 border-b">
			<div className="mx-auto flex max-w-4xl items-center justify-between gap-8 px-4 py-4 sm:px-6">
				<div className="w-full text-muted-foreground flex items-center gap-8 font-medium md:justify-between lg:gap-16">
					<a href="#">
						<Logo theme={"dark"} />
					</a>
					<div className="flex items-center gap-8">
						{links.map((item, index) => (
							<a
								key={index}
								href={item.href}
								className="hover:text-primary max-md:hidden"
							>
								{item.label}
							</a>
						))}
						<ThemeToggle />
					</div>
				</div>

				<div className="flex items-center gap-6">
					{/* Search */}
					<Dialog>
						<form>
							<DialogTrigger asChild>
								<Button variant="ghost" size="icon">
									<SearchIcon />
									<span className="sr-only">Search</span>
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Player Search</DialogTitle>
								</DialogHeader>
								<PlayerSearch />
							</DialogContent>
						</form>
					</Dialog>

					{/* Hamburger Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger className="md:hidden" asChild>
							<Button variant="outline" size="icon">
								<MenuIcon />
								<span className="sr-only">Menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end">
							<DropdownMenuGroup>
								{links.map((item, index) => (
									<DropdownMenuItem key={index}>
										<a href={item.href}>{item.label}</a>
									</DropdownMenuItem>
								))}
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
