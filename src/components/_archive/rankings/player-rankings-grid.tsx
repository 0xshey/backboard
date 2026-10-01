"use client";
import { useState, useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

import { sortPlayers } from "./sorting-utils";
import { PlayerRankingRow } from "./player-ranking-row";

export function PlayerRankingsGrid({
	gamePlayers,
	loading,
}: {
	gamePlayers?: any[];
	loading?: boolean;
}) {
	const [rowData, setRowData] = useState<any[]>([]);

	// Sorting state
	const [sortField, setSortField] = useState<string>("fp");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	if (loading) {
		return (
			<div className="w-full max-w-6xl flex flex-col gap-4">
				<div className="flex items-center gap-6 p-1 justify-between">
					<Skeleton className="h-16 w-full" />
					<Skeleton className="h-16 w-full" />
				</div>
				<div className="flex flex-col gap-2">
					{Array.from({ length: 10 }).map((_, i) => (
						<Skeleton key={i} className="h-8 w-full rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	if (!gamePlayers) return null;

	const [enrichedData, setEnrichedData] = useState<any[]>([]);

	useEffect(() => {
		if (!gamePlayers) return;
		const withRank = [...gamePlayers]
			.sort((a, b) => {
				if (b.fp !== a.fp) return b.fp - a.fp;
				const getDelta = (p: any) =>
					p.fp -
					(p.player.season_averages[0]?.nba_fantasy_points || 0);
				return getDelta(b) - getDelta(a);
			})
			.map((p, i) => ({ ...p, fpRank: i + 1 }));
		setEnrichedData(withRank);
	}, [gamePlayers]);

	useEffect(() => {
		if (enrichedData.length === 0) {
			setRowData([]);
			return;
		}
		const sorted = sortPlayers(enrichedData, sortField, sortDirection);
		setRowData(sorted);
	}, [enrichedData, sortField, sortDirection]);

	const handleSort = (field: string) => {
		if (sortField === field) {
			if (sortDirection === "desc") {
				setSortDirection("asc");
			} else {
				setSortField("fp");
				setSortDirection("desc");
			}
		} else {
			setSortField(field);
			setSortDirection("desc");
			if (field === "player") setSortDirection("asc");
		}
	};

	const SortableHead = ({
		label,
		field,
		className,
	}: {
		label: string;
		field: string;
		className?: string;
	}) => {
		const isActive = sortField === field;
		return (
			<TableHead
				className={cn(
					"cursor-pointer select-none text-[10px] md:text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors whitespace-nowrap h-8",
					isActive && "text-foreground bg-muted/30",
					className
				)}
				onClick={() => handleSort(field)}
			>
				<span className="inline-flex items-center gap-0.5">
					{label}
					{isActive &&
						(sortDirection === "asc" ? (
							<ArrowUpIcon className="w-3 h-3" />
						) : (
							<ArrowDownIcon className="w-3 h-3" />
						))}
				</span>
			</TableHead>
		);
	};

	return (
		<div className="w-full">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent border-b border-border/50">
						<SortableHead
							label="Player"
							field="player"
							className="sticky left-0 z-20 bg-background text-left min-w-32 md:min-w-72"
						/>
						<SortableHead
							label="MIN"
							field="minutes"
							className="text-center w-12"
						/>
						{["pts", "reb", "ast", "stl", "blk", "tov"].map(
							(stat) => (
								<SortableHead
									key={stat}
									label={stat.toUpperCase()}
									field={stat}
									className="text-center w-10 md:w-14"
								/>
							)
						)}
						<SortableHead
							label="FP"
							field="fp"
							className="text-center w-14 md:w-20"
						/>
						<SortableHead
							label="FPδ"
							field="fp_delta"
							className="text-center w-16 md:w-20"
						/>
						<SortableHead
							label="FP/M"
							field="fp_per_min"
							className="text-center w-16 md:w-20"
						/>
						{["fg", "3p", "ft"].map((stat) => (
							<SortableHead
								key={stat}
								label={stat.toUpperCase()}
								field={stat}
								className="text-center w-14 md:w-20"
							/>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{rowData.map((player_game) => (
						<PlayerRankingRow
							key={player_game.player.id}
							player_game={player_game}
							sortField={sortField}
						/>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
