"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Logo from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navigator({ className }: { className?: string }) {
	const { theme } = useTheme();

	const navLinks = [
		{
			href: "/players",
			title: "Players",
			description: "View live and historical player fantasy stats",
		},
		{
			href: "/games",
			title: "Games",
			description: "View and track daily NBA games live",
		},
		{
			href: "/standings",
			title: "Standings",
			description: "View the current NBA standings",
		},
	];

	return (
		<div
			className={`w-full max-w-full flex justify-center relative z-40 ${className}`}
		>
			<NavigationMenu className="w-full max-w-xl flex justify-between mt-8 py-1 px-4">
				{/* Home Link */}
				<Link href="/">
					<div className="flex items-center gap-1 px-2">
						{theme && (
							<Logo
								size={32}
								color={theme === "light" ? "black" : "white"}
							/>
						)}
						<p className="font-semibold font-sans block text-md tracking-tight">
							Backboard
						</p>
					</div>
				</Link>
				<NavigationMenuList className="gap-4">
					<NavigationMenuItem>
						<NavigationMenuTrigger>Tools</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="justify-between w-[400px] md:w-[600px] p-4 grid grid-cols-3 gap-4">
								{navLinks.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className="bg-muted aspect-square p-3 rounded-xl flex flex-col justify-between"
									>
										<span className="leading-none font-medium md:text-lg">
											{link.title}
										</span>
										<span className="text-xs md:text-sm text-muted-foreground">
											{link.description}
										</span>
									</Link>
								))}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<ThemeToggle />
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}
