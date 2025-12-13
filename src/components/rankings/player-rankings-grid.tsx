'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { getPerformanceFlags } from "@/lib/player-performance-flags";
import { Badge } from "@/components/ui/badge";


import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatSecondsToMMSS, valueToRGB, cn } from "@/lib/utils";
import { 
  ArrowUpIcon, ArrowDownIcon, ChevronUp, ChevronDown, 
  ChevronsUp, ChevronsDown, Percent, Hash
} from "lucide-react";

import { ColumnHeader } from "./column-header";
import { sortPlayers } from "./sorting-utils";

export function PlayerRankingsGrid({ gamePlayers, loading }: { gamePlayers?: any[], loading?: boolean }) {
	const [rowData, setRowData] = useState<any[]>([]);
	const [showMoreData, setShowMoreData] = useState<boolean>(true);

	// Sorting state
	const [sortField, setSortField] = useState<string>("fp");
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
		const withRank = [...gamePlayers].sort((a, b) => {
			if (b.fp !== a.fp) return b.fp - a.fp;
			// Tie breaker: delta
			const getDelta = (p: any) => p.fp - (p.player.season_averages[0]?.nba_fantasy_points || 0);
			return getDelta(b) - getDelta(a);
		}).map((p, i) => ({ ...p, fpRank: i + 1 }));
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
            if (sortDirection === 'desc') {
                setSortDirection('asc');
            } else {
                 // Check if we should reset to default or just toggle back to desc
                 setSortField("fp");
                 setSortDirection("desc");
            }
        } else {
            // New field -> Default to desc
            setSortField(field);
            setSortDirection('desc');
            // Exception: Player name default asc
            if (field === 'player') setSortDirection('asc');
        }
    };

	// ----------

	return (
		<div className="w-full flex flex-col gap-4">

			{/* Controls */}
			<div className="flex items-center gap-8 border border-transparent">
				{/* Removed Sorting Select as it is now in headers - keeping Show More Data */}
				<div className="flex items-center space-x-2">
					<Checkbox id="show-more-data" checked={showMoreData} onCheckedChange={(c) => setShowMoreData(!!c)} />
					<Label htmlFor="show-more-data" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Show More Data
					</Label>
				</div>
			</div>

			
			{/* Table */}
			<div className="overflow-x-auto w-full h-full pb-4">
				<div className="h-full min-w-max flex flex-col gap-1">
				
					{/* Column controller */}
					<div className="w-full h-8 flex items-center gap-1 p-0.5 rounded-lg">
						<ColumnHeader
							label="Player" 
							field="player" 
							isActive={sortField === 'player'} 
							sortDirection={sortDirection} 
							onSort={handleSort} 
							className="sticky left-0 z-20 min-w-50 max-w-50 justify-start pl-9"
						/>
						<ColumnHeader 
							label="Min" 
							field="minutes" 
							isActive={sortField === 'minutes'} 
							sortDirection={sortDirection} 
							onSort={handleSort} 
							className="min-w-14"
						/>
						<div className="min-w-70 grid grid-cols-6 gap-0 h-full">
							{['pts', 'reb', 'ast', 'stl', 'blk', 'tov'].map(stat => (
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
						<ColumnHeader 
							label="FP" 
							field="fp" 
							isActive={sortField === 'fp'} 
							sortDirection={sortDirection} 
							onSort={handleSort} 
							className="min-w-16"
						/>
						<ColumnHeader 
							label="FPδ" 
							field="fp_delta" 
							isActive={sortField === 'fp_delta'} 
							sortDirection={sortDirection} 
							onSort={handleSort} 
							className="min-w-16"
						/>
						<div className="min-w-60 h-full grid grid-cols-3 gap-0">
							{['fg', '3p', 'ft'].map(stat => (
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

					{
						rowData.map((player_game, index) => {
							const playerName = `${player_game.player.first_name} ${player_game.player.last_name}`;
							// Visual dimming for First Name if sorting by Player
							const isPlayerSort = sortField === 'player';

							return (
								<div className={cn("flex items-center gap-1 h-9 p-1 rounded-xl border border-transparent hover:bg-muted/30 transition-colors group/row", showMoreData && "h-11")} key={player_game.player.id}>
									
									{/* COLUMN: Player Details Header */}
									<div className={cn("sticky left-0 z-10 ",
										"min-w-50 max-w-50 overflow-x-hidden h-full flex items-center px-2",
										"rounded-lg border border-transparent cursor-pointer hover:border-border transition-colors backdrop-blur-sm")}
									>
										<p className="text-sm text-muted-foreground/50 mr-2 min-w-4 text-right">{player_game.fpRank}</p>

										{/* Player Name & Team */}
										<div className="flex h-fit items-center gap-2 text-muted-foreground py-1 rounded-full">
											
											<div className="min-w-4 items-center gap-1">
												<Image
													src={teamLogoURL(player_game.team.id)}
													alt={player_game.team.name}
													width={20}
													height={20}
													quality={100}
													className="opacity-80"
												/>
												
											</div>

											<div className="w-full flex flex-col md:flex-row items-start md:items-center md:gap-1 truncate">
												<p className={cn("whitespace-nowrap text-xs font-medium text-muted-foreground md:text-foreground", isPlayerSort && "opacity-50")}>
													{player_game.player.first_name}
												</p>
												<p className="whitespace-nowrap truncate text-xs font-medium text-foreground">
													{player_game.player.last_name}
												</p>
											</div>	
										</div>
									</div>

									{/* Scrollable row content */}
									<div className={cn("flex items-center gap-1 h-full")}>

										{/* Minutes */}
										<div className={cn("flex justify-center items-center rounded-lg px-1 min-h-full relative min-w-14 border border-transparent transition-colors cursor-pointer")}>
											<p className="text-xs text-muted-foreground font-mono">{formatSecondsToMMSS(player_game.seconds)}</p>
											{
												player_game.game.status_code == 2 && 
												<span className="absolute right-2 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
											}
										</div>

										{/* Counting stats */}
										<div className="h-full items-center jusitfy-center grid grid-cols-6 rounded-lg min-w-70 py-0.5 border border-transparent">
											{[
												{ value: player_game.points, label: 'pts', avg: player_game.player.season_averages?.[0]?.points, r: 10 },
												{ value: player_game.rebounds_total, label: 'reb', avg: player_game.player.season_averages?.[0]?.rebounds_total, r: 4 },
												{ value: player_game.assists, label: 'ast', avg: player_game.player.season_averages?.[0]?.assists, r: 3 },
												{ value: player_game.steals, label: 'stl', avg: player_game.player.season_averages?.[0]?.steals, r: 2 },
												{ value: player_game.blocks, label: 'blk', avg: player_game.player.season_averages?.[0]?.blocks, r: 2 },
												{ value: player_game.turnovers, label: 'tov', avg: player_game.player.season_averages?.[0]?.turnovers, r: 2, invertColor: true },
											].map((stat, index) => {

												const delta = stat.avg ? stat.value - stat.avg : 0;
												const isPositive = delta > 0;
												const colorClass = stat.invertColor 
													? (isPositive ? "text-red-500" : "text-green-500")
													: (isPositive ? "text-green-500" : "text-red-500");
												
												const pctDiff = (stat.avg ? delta / stat.avg : 0) * (stat.label == 'tov' ? -1 : 1);
												const scaledDelta = delta / stat.r;

												const isLargeDiff = pctDiff > 0.75;
												const isSmallDiff = pctDiff <= 0.20 && stat.avg !== 0;

												let Icon;
												Icon = isPositive
													? (isLargeDiff ? ChevronsUp : ChevronUp)
													: (isLargeDiff ? ChevronsDown : ChevronDown);

												// Visual Swap Logic
												const isSortedByThisDelta = sortField === `${stat.label}_delta`;
												
												return (
													<div key={index} className={cn(
														"col-span-1 w-full flex flex-col gap-0.5 justify-between items-end px-1 py-1 rounded-lg border border-transparent hover:bg-muted transition-colors cursor-pointer"
													)}>
														
														{/* Value Row */}
														<div className="w-full flex justify-start items-end gap-0.5">
															<div className={cn("text-sm font-semibold leading-none", isSortedByThisDelta && "text-xs text-muted-foreground opacity-70 font-normal")}>{stat.value}</div> 
															<span className="text-[0.5rem] leading-none text-muted-foreground uppercase tracking-wider">{stat.label}</span>
														</div>

														{/* Delta / Info Row */}
														{ showMoreData &&
															<div className={cn("w-full flex items-center justify-start")} 
																style={{ 
																	color: valueToRGB({ value: scaledDelta, min: -0.75, max: 0.75, midColor: [180, 180, 180, 0.5] }),
																}} 
															>
																<span className={cn("text-[10px] font-medium leading-none", isSortedByThisDelta && "text-sm font-bold")}>
																	{Math.abs(delta).toFixed(1)}
																	{/* {scaledDelta.toFixed(1)} */}
																</span>
																<Icon className={cn("w-3 h-3", isSortedByThisDelta && "w-4 h-4 stroke-[3px]")} />
															</div>
														}
													</div>
												)})}
										</div>

										{/* FP */}
										<div
											className="flex h-full justify-end items-center rounded-lg min-w-16 p-1 border border-transparent hover:border-white/50 cursor-pointer"
											style={{ backgroundColor: valueToRGB({ value: player_game.fp, min: 10, max: 60 }) }}
										>
											<div className="flex items-end gap-0.5">
												<div className="text-sm leading-none font-semibold text-white drop-shadow-sm">{player_game.fp.toFixed(1)}</div>
												<span className="text-[0.5rem] leading-none text-white/80 font-medium uppercase">fp</span>
											</div>
										</div>

										{/* FP Delta */}
										<div className="h-full flex justify-end items-center rounded-lg min-w-16 p-1 border border-transparent hover:border-border transition-colors cursor-pointer">
											{player_game.player.season_averages[0]?.nba_fantasy_points ? (
												(() => {
													const avg = player_game.player.season_averages[0].nba_fantasy_points;
													const delta = player_game.fp - avg; // Absolute delta
													return (
														<div className="flex justify-end items-end relative gap-0.5">
															<div 
																className="text-sm leading-none font-semibold tabular-nums"
																style={{ color: valueToRGB({ value: delta, min: -40, max: 40, midColor: [200, 200, 200, 1] }) }} 
															>
																{delta > 0 ? "+" : ""}{delta.toFixed(1)}
															</div>
															<span className="text-[10px] leading-none text-muted-foreground tracking-wider uppercase">δ</span>
														</div>
													);
												})()
											) : (
												<span className="text-muted-foreground text-xs">-</span>
											)}
										</div>
										
										{/* Efficiency */}
										<div className={cn("min-w-60 h-full grid grid-cols-3 gap-1")}>
											{[
												{ made: player_game.field_goals_made, attempted: player_game.field_goals_attempted, percentage: player_game.field_goals_percentage, label: 'fg', low: 0.33, mid: 0.47, high: 0.75, attemptThreshold: 15 },
												{ made: player_game.three_pointers_made, attempted: player_game.three_pointers_attempted, percentage: player_game.three_pointers_percentage, label: '3p', low: 0.25, mid: 0.36, high: 0.60, attemptThreshold: 8},
												{ made: player_game.free_throws_made, attempted: player_game.free_throws_attempted, percentage: player_game.free_throws_percentage, label: 'ft', low: 0.6, mid: 0.8, high: 1.0, attemptThreshold: 10 },
											].map((stat, index) => {
												const significance = stat.percentage * (stat.attempted / stat.attemptThreshold);
												return (
													<div key={index} 
														className={cn("col-span-1 w-full h-full flex flex-col gap-0.5 justify-center items-end px-1 py-1 rounded-lg border hover:border-border transition-colors cursor-pointer")}
														style={{ 
															borderColor: valueToRGB({ value: significance, min: stat.low, max: stat.high }),
															backgroundColor: valueToRGB({ value: stat.percentage , min: stat.low, max: stat.high,
																lowColor: [192, 11, 35, 0.3],     // red
																midColor: [0, 0, 0, 0],   // transparent
																highColor: [43, 168, 74, 0.3],    // green
															}),
														}}
													>
														<div className="w-full flex justify-end items-end gap-0.5">
															<div className="text-sm font-semibold leading-none">{stat.made}/{stat.attempted}</div> 
															<span className="text-[0.5rem] leading-none text-muted-foreground uppercase tracking-wider">{stat.label}</span>
														</div>
														{ showMoreData &&
															<div className={cn("w-full flex items-center justify-end")}>
																<span className="text-[10px] font-medium leading-none">
																	{stat.attempted > 0 ? (stat.percentage * 100).toFixed(0) : "-"}%
																</span>
															</div>
														}
													</div>
												)
											})}
										</div>
									</div>
								</div>
							)
						})
					}
				</div>
			</div>
		</div>
	)
}