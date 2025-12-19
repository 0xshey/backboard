"use client";
import { useState, useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { ColumnHeader } from "./column-header";
import { sortPlayers } from "./sorting-utils";
import { PlayerRankingRow } from "./player-ranking-row";

export const RANKINGS_GRID_DEBUG = false;
export const COLUMN_WIDTHS = {
	player: "min-w-32 max-w-32 md:min-w-60 md:max-w-60",
	minutes: "min-w-16",
	stats: "min-w-70 md:min-w-80",
	fp: "min-w-16 md:min-w-20",
	fp_delta: "min-w-16 md:min-w-20",
	efficiency: "min-w-60 md:min-w-72",
};

export function PlayerRankingsGrid({
	gamePlayers,
	loading,
}: {
	gamePlayers?: any[];
	loading?: boolean;
}) {
	const [rowData, setRowData] = useState<any[]>([]);
	const [showMoreData, setShowMoreData] = useState<boolean>(true);

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

	// Calculate fpRanks once on load or when gamePlayers changes
	const [enrichedData, setEnrichedData] = useState<any[]>([]);

	useEffect(() => {
		if (!gamePlayers) return;
		// Sort by FP desc, then Delta desc to establish "True Rank"
		const withRank = [...gamePlayers]
			.sort((a, b) => {
				if (b.fp !== a.fp) return b.fp - a.fp;
				// Tie breaker: delta
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
			// Toggle direction: desc -> asc -> default (fp desc)
			if (sortDirection === "desc") {
				setSortDirection("asc");
			} else {
				// Check if we should reset to default or just toggle back to desc
				setSortField("fp");
				setSortDirection("desc");
			}
		} else {
			// New field -> Default to desc
			setSortField(field);
			setSortDirection("desc");
			// Exception: Player name default asc
			if (field === "player") setSortDirection("asc");
		}
	};

	// ----------

	return (
		<div className="w-full flex flex-col gap-4">
			{/* Controls */}
			<div
				className={cn(
					"flex items-center gap-8 border",
					!RANKINGS_GRID_DEBUG && "border-transparent"
				)}
			>
				{/* Removed Sorting Select as it is now in headers - keeping Show More Data */}
				<div className="flex items-center space-x-2">
					<Checkbox
						id="show-more-data"
						checked={showMoreData}
						onCheckedChange={(c) => setShowMoreData(!!c)}
					/>
					<Label
						htmlFor="show-more-data"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Show More Data
					</Label>
				</div>
			</div>

			{/* Table */}
			<div
				className={cn(
					"overflow-x-auto w-full h-full pb-4 border",
					!RANKINGS_GRID_DEBUG && "border-transparent"
				)}
			>
				<div className="h-full min-w-max flex flex-col gap-1">
					{/* Column controller */}
					<div className="w-full h-8 flex items-center gap-1 rounded-lg">
						<ColumnHeader
							label="Player"
							field="player"
							isActive={sortField === "player"}
							sortDirection={sortDirection}
							onSort={handleSort}
							className={cn(
								"sticky left-0 z-20 justify-start pl-9",
								COLUMN_WIDTHS.player
							)}
						/>
						<ColumnHeader
							label="Min"
							field="minutes"
							isActive={sortField === "minutes"}
							sortDirection={sortDirection}
							onSort={handleSort}
							className={COLUMN_WIDTHS.minutes}
						/>
						<div
							className={cn(
								"grid grid-cols-6 gap-0 h-full",
								COLUMN_WIDTHS.stats
							)}
						>
							{["pts", "reb", "ast", "stl", "blk", "tov"].map(
								(stat) => (
									<ColumnHeader
										key={stat}
										label={stat.toUpperCase()}
										field={stat}
										isActive={sortField === stat}
										sortDirection={sortDirection}
										onSort={handleSort}
									/>
								)
							)}
						</div>
						<ColumnHeader
							label="FP"
							field="fp"
							isActive={sortField === "fp"}
							sortDirection={sortDirection}
							onSort={handleSort}
							className={COLUMN_WIDTHS.fp}
						/>
						<ColumnHeader
							label="FPδ"
							field="fp_delta"
							isActive={sortField === "fp_delta"}
							sortDirection={sortDirection}
							onSort={handleSort}
							className={COLUMN_WIDTHS.fp_delta}
						/>
						<div
							className={cn(
								"h-full grid grid-cols-3 gap-1",
								COLUMN_WIDTHS.efficiency
							)}
						>
							{["fg", "3p", "ft"].map((stat) => (
								<ColumnHeader
									key={stat}
									label={stat.toUpperCase()}
									field={stat}
									isActive={sortField === stat}
									sortDirection={sortDirection}
									onSort={handleSort}
								/>
							))}
						</div>
					</div>

					{rowData.map((player_game, index) => (
						<PlayerRankingRow
							key={player_game.player.id}
							player_game={player_game}
							sortField={sortField}
							showMoreData={showMoreData}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
