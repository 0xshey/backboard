"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Logo from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export default function Navigator({ className }: { className?: string }) {
	const { theme } = useTheme();
	return (
		<nav
			className={`w-full max-w-full flex flex-col items-center ${className}`}
		>
			<div className="w-full flex justify-center relative">
				<div className="flex justify-between items-center w-full px-4 py-2 max-w-xl mt-8 mb-2 relative">
					<div className="w-full flex gap-8 items-center px-5 py-2 min-h-12">
						{/* Home Link */}
						<Link href="/">
							<div className="flex items-center gap-1">
								<Logo
									size={36}
									color={theme == "dark" ? "white" : "black"}
								/>
								<p className="font-semibold font-sans block text-md tracking-tight">
									Backboard
								</p>
							</div>
						</Link>
					</div>
					<div className="flex gap-8 items-center px-5 py-2 min-h-12">
						{/* Articles Link */}
						<Link
							href="/overview"
							className="text-sm hover:underline underline-offset-2"
						>
							Overview
						</Link>
						<ThemeToggle />
					</div>
				</div>
			</div>
		</nav>
	);

	return (
		<div className="min-w-full mt-8 flex justify-center bg-red-200">
			<NavigationMenu className="px-8 py-2 bg-red-300 max-w-md w-full">
				<NavigationMenuList className="gap-32">
					<NavigationMenuItem>
						<div className="flex items-center gap-2">
							<Image
								src="/logo.svg"
								alt="Logo"
								width={32}
								height={32}
							/>
							<p className="font-semibold font-mono hidden md:block">
								Backboard
							</p>
						</div>
					</NavigationMenuItem>
					<NavigationMenuItem>
						<ThemeToggle />
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenu>
		</div>
	);
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
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
