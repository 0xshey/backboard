"use client";

import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DISCLAIMER, type DataSource } from "@/lib/data/data-sources";
import { cn } from "@/lib/utils";

type DataSourceInfoProps = {
	sources: DataSource[];
	/** Pre-formatted "last updated" text. */
	updated?: string;
	/** Extra page-specific note, e.g. how a ranking is calculated. */
	note?: string;
	className?: string;
};

/** (i) button that opens a small popover listing the page's data sources. */
export function DataSourceInfo({ sources, updated, note, className }: DataSourceInfoProps) {
	return (
		<Popover>
			<PopoverTrigger
				aria-label="About this data"
				className={cn(
					"inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors",
					className,
				)}
			>
				<Info className="size-4" />
			</PopoverTrigger>
			<PopoverContent align="start" className="w-80 text-sm">
				<p className="mb-2 font-medium">Data sources</p>
				<ul className="mb-3 flex flex-col gap-1.5">
					{sources.map((s) => (
						<li key={`${s.label}-${s.detail}`} className="flex gap-2">
							<span className="w-24 shrink-0 font-medium">{s.label}</span>
							<span className="text-muted-foreground">{s.detail}</span>
						</li>
					))}
				</ul>
				{note && <p className="mb-2 text-xs text-muted-foreground">{note}</p>}
				{updated && <p className="mb-2 text-xs text-muted-foreground">Last updated {updated}</p>}
				<p className="border-t pt-2 text-xs text-muted-foreground">{DISCLAIMER}</p>
			</PopoverContent>
		</Popover>
	);
}
