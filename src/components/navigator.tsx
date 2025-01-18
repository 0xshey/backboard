"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

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
		<div className="w-full max-w-full flex justify-center relative ">
			<NavigationMenu className="w-full max-w-xl flex justify-between mt-8 py-1 px-4">
				{/* Home Link */}
				<Link href="/">
					<div className="flex items-center gap-1 px-2">
						<Image
							src={
								theme && theme == "light"
									? "/logo.svg"
									: "/logo-white.svg"
							}
							alt="Logo"
							width={32}
							height={32}
						/>
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

// 	return (
// 		<nav
// 			className={`w-full max-w-full flex flex-col items-center ${className}`}
// 		>
// 			<div className="w-full flex justify-center relative">
// 				<div className="flex justify-between items-center w-full px-4 py-2 max-w-xl mt-8 mb-2 relative">
// 					<div className="w-full flex gap-8 items-center px-5 py-2 min-h-12">
// 						{/* Home Link */}
// 						<Link href="/">
// 							<div className="flex items-center gap-1">
// 								<Image
// 									src={
// 										theme && theme == "light"
// 											? "/logo.svg"
// 											: "/logo-white.svg"
// 									}
// 									alt="Logo"
// 									width={26}
// 									height={26}
// 								/>
// 								<p className="font-semibold font-sans block text-sm tracking-tight">
// 									Backboard
// 								</p>
// 							</div>
// 						</Link>
// 					</div>
// 					<div className="flex gap-4 items-center px-5 py-2 min-h-12">
// 						{navLinks.map((link) => (
// 							<Link
// 								key={link.href}
// 								href={link.href}
// 								className="text-xs hover:underline underline-offset-2"
// 							>
// 								{link.title}
// 							</Link>
// 						))}
// 						<ThemeToggle />
// 					</div>
// 				</div>
// 			</div>
// 		</nav>
// 	);
// }

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li className="col-span-1">
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">
						{title}
					</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	);
});
ListItem.displayName = "ListItem";
