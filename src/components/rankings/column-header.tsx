import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { RANKINGS_GRID_DEBUG as DEBUG } from "./player-rankings-grid";

interface ColumnHeaderProps {
	label: string;
	field: string;
	isActive: boolean;
	sortDirection: "asc" | "desc";
	onSort: (field: string) => void;
	className?: string;
}

export function ColumnHeader({
	label,
	field,
	isActive,
	sortDirection,
	onSort,
	className,
}: ColumnHeaderProps) {
	return (
		<div
			className={cn(
				"w-full h-full flex items-center gap-1 justify-center transition-colors border",
				"cursor-pointer text-xs md:text-sm font-mono border hover:bg-muted/50 hover:border-border rounded-md text-muted-foreground",
				isActive && "text-foreground font-medium bg-muted/30",
				!DEBUG && "border-transparent",
				className
			)}
			onClick={() => onSort(field)}
		>
			{label}
			{isActive &&
				(sortDirection === "asc" ? (
					<ArrowUpIcon className="w-3 h-3" />
				) : (
					<ArrowDownIcon className="w-3 h-3" />
				))}
		</div>
	);
}
