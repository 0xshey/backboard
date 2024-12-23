"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "next-themes";

export default function Navigator({ className }: { className?: string }) {
	const { theme } = useTheme();

	const navLinks = [
		{
			title: "Players",
			href: "/players",
		},
	];

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
								<Image
									src={
										theme == "dark"
											? "/logo-white.svg"
											: "/logo.svg"
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
					</div>
					<div className="flex gap-8 items-center px-5 py-2 min-h-12">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-sm hover:underline underline-offset-2"
							>
								{link.title}
							</Link>
						))}
						<ThemeToggle />
					</div>
				</div>
			</div>
		</nav>
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
