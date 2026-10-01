"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { RANKINGS_LINKS } from "@/lib/navigation-links";

export function RankingsTabs() {
	const pathname = usePathname();

	return (
		<div className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground">
			{RANKINGS_LINKS.map((link) => {
				const active = pathname === link.href;
				return (
					<Link
						key={link.href}
						href={link.href}
						className={cn(
							"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
							active
								? "bg-background text-foreground shadow"
								: "hover:text-foreground",
						)}
					>
						{link.label}
					</Link>
				);
			})}
		</div>
	);
}
