"use client";

import { useState, useMemo } from "react";
import { valueToRGB, cn } from "@/lib/utils";
import type { PlayerConsistency } from "@/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

type SortField =
	| "player"
	| "games_played"
	| "avg_fantasy_points"
	| "consistency_std"
	| "variation_pct";
type SortDirection = "asc" | "desc" | "none";

interface SortState {
	field: SortField;
	direction: SortDirection;
}

export function ConsistencyGrid({ data }: { data: PlayerConsistency[] }) {
	const [sort, setSort] = useState<SortState>({
		field: "variation_pct",
		direction: "asc",
	});

	const handleSort = (field: SortField) => {
		setSort((prev) => {
			if (prev.field === field) {
				if (prev.direction === "asc")
					return { field, direction: "desc" };
				if (prev.direction === "desc")
					return { field: "variation_pct", direction: "asc" };
			}
			return { field, direction: "asc" };
		});
	};

	const processedData = useMemo(() => {
		let result = [...data].filter(
			(player) => (player.games_missed ?? 0) <= (player.games_played ?? 0)
		);

		if (sort.direction !== "none") {
			result.sort((a, b) => {
				let valA: any;
				let valB: any;

				if (sort.field === "player") {
					valA = `${a.first_name} ${a.last_name}`.toLowerCase();
					valB = `${b.first_name} ${b.last_name}`.toLowerCase();
				} else {
					valA = a[sort.field as keyof PlayerConsistency] ?? 0;
					valB = b[sort.field as keyof PlayerConsistency] ?? 0;
				}

				if (valA < valB) return sort.direction === "asc" ? -1 : 1;
				if (valA > valB) return sort.direction === "asc" ? 1 : -1;
				return 0;
			});
		}

		return result;
	}, [data, sort]);

	const HeaderCell = ({
		label,
		field,
		className,
	}: {
		label: string;
		field: SortField;
		className?: string;
	}) => {
		const isActive = sort.field === field;
		return (
			<TableHead
				className={cn(
					"cursor-pointer select-none hover:bg-muted/50 transition-colors",
					className
				)}
				onClick={() => handleSort(field)}
			>
				<div
					className={cn(
						"flex items-center gap-1",
						className?.includes("text-right") && "justify-end"
					)}
				>
					{label}
					{isActive &&
						(sort.direction === "asc" ? (
							<ArrowUpIcon className="w-4 h-4" />
						) : (
							<ArrowDownIcon className="w-4 h-4" />
						))}
				</div>
			</TableHead>
		);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow className="font-semibold text-muted-foreground hover:bg-transparent border-b">
					<HeaderCell
						label="Player"
						field="player"
						className="w-[300px]"
					/>
					<HeaderCell
						label="Games (P/M)"
						field="games_played"
						className="text-right"
					/>
					<HeaderCell
						label="FP/G"
						field="avg_fantasy_points"
						className="text-right"
					/>
					<HeaderCell
						label="σ"
						field="consistency_std"
						className="text-right"
					/>
					<HeaderCell
						label="σ%"
						field="variation_pct"
						className="text-right"
					/>
				</TableRow>
			</TableHeader>
			<TableBody>
				{processedData?.map((row) => (
					<TableRow
						key={row.player_id}
						className="text-md md:text-xl font-semibold border-b last:border-0"
					>
						<TableCell>
							{row.first_name} {row.last_name}
						</TableCell>
						<TableCell className="text-right">
							<div className="flex justify-end gap-2">
								<span>{row.games_played ?? 0}</span>
								<span className="text-muted-foreground">
									{row.games_missed ?? 0}
								</span>
							</div>
						</TableCell>
						<TableCell
							className="text-right"
							style={{
								color: valueToRGB({
									value: row.avg_fantasy_points ?? 0,
									midColor: [200, 200, 200, 1],
								}),
							}}
						>
							{row.avg_fantasy_points?.toFixed(2) ?? "0.00"}
						</TableCell>
						<TableCell className="text-right">
							{row.consistency_std?.toFixed(2) ?? "0.00"}
						</TableCell>
						<TableCell
							className="text-right"
							style={{
								color: valueToRGB({
									value: row.variation_pct ?? 0,
									min: 15,
									max: 60,
									lowColor: [43, 168, 74, 1],
									midColor: [200, 200, 200, 1],
									highColor: [192, 11, 35, 1],
								}),
							}}
						>
							{row.variation_pct?.toFixed(1) ?? "0.0"}%
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
