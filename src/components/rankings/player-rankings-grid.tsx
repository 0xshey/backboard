'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { getPerformanceFlags } from "@/lib/player-performance-flags";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatSecondsToMMSS, valueToRGB } from "@/lib/utils";
import { DotIcon, ArrowUpIcon, ArrowDownIcon, ChevronUp, ChevronDown, ChevronsUp, ChevronsDown, Equal, EqualApproximately, Icon } from "lucide-react";
import { cn } from "@/lib/utils";


import { Skeleton } from "@/components/ui/skeleton";

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

	useEffect(() => {
        // Create a copy to sort
        const sorted = [...gamePlayers].sort((a, b) => {
            let valA = 0;
            let valB = 0;

            // Helper to safe access nested or calculated fields
            const getVal = (item: any, field: string) => {
                switch(field) {
                    case 'fp': return item.fp;
                    case 'minutes': return item.seconds;
                    case 'pts': return item.points;
                    case 'reb': return item.rebounds_total;
                    case 'ast': return item.assists;
                    case 'stl': return item.steals;
                    case 'blk': return item.blocks;
                    case 'tov': return item.turnovers;
                    case 'fp_delta': 
                        const avg = item.player.season_averages[0]?.nba_fantasy_points || 0;
                        if (avg === 0) return 0;
                        return item.fp - avg;
                    default: return 0;
                }
            };

            valA = getVal(a, sortField);
            valB = getVal(b, sortField);

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

		setRowData(sorted);
	}, [gamePlayers, sortField, sortDirection]);

	return (
		<div className="w-full flex flex-col gap-4">

			{/* Controls */}
			<div className="flex items-center gap-8 border border-transparent">
				<div className="flex items-center gap-2 max-w-full">
					<Select value={sortField} onValueChange={setSortField}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="fp">Fantasy Points</SelectItem>
							<SelectItem value="fp_delta">FP Delta</SelectItem>
							<SelectItem value="pts">Points</SelectItem>
							<SelectItem value="reb">Rebounds</SelectItem>
							<SelectItem value="ast">Assists</SelectItem>
							<SelectItem value="stl">Steals</SelectItem>
							<SelectItem value="blk">Blocks</SelectItem>
							<SelectItem value="tov">Turnovers</SelectItem>
							<SelectItem value="minutes">Minutes</SelectItem>
						</SelectContent>
					</Select>
					<Button 
						variant="outline" 
						size="icon"
						onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
					>
						{sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
					</Button>
				</div>
				
				<div className="flex items-center space-x-2">
					<Checkbox id="show-more-data" checked={showMoreData} onCheckedChange={(c) => setShowMoreData(!!c)} />
					<Label htmlFor="show-more-data" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
						Show More Data
					</Label>
				</div>
			</div>

			
			{/* Table */}
			<div className="overflow-x-auto w-full pb-4">
				<div className="min-w-max flex flex-col gap-2">
				
				{/* Column controller */}
				<div className="w-full flex items-center gap-1 px-0.5">
					<div className="sticky left-0 z-10 bg-muted min-w-50 h-full flex justify-start items-center text-center text-sm text-muted-foreground">Player</div>
					<div className="bg-muted min-w-14 h-full flex justify-center items-center text-center text-sm text-muted-foreground">Min</div>
					<div className="bg-muted min-w-70 h-full flex justify-center items-center text-center text-sm text-muted-foreground">Stats</div>
					<div className="bg-muted min-w-16 h-full flex justify-center items-center text-center text-sm text-muted-foreground">FP</div>
					<div className="bg-muted min-w-16 h-full flex justify-center items-center text-center text-sm text-muted-foreground">FPδ</div>
					<div className="bg-muted min-w-60 h-full flex justify-center items-center text-center text-sm text-muted-foreground">Efficiency</div>
				</div>

				{
					rowData.map((player_game, index) => {
						const playerName = `${player_game.player.first_name} ${player_game.player.last_name}`;

						return (
							<div className="flex items-center gap-1 h-11 p-0.5 rounded-xl border" key={player_game.player.id}>
								
								{/* COLUMN: Player Details Header */}
								<div className={cn("sticky left-0 z-10 ",
									"min-w-50 max-w-50 overflow-x-hidden h-full flex items-center px-2",
									"rounded-lg border backdrop-blur-sm")}
								>
									<p className="text-sm text-muted-foreground/50 mr-2">{index + 1}</p>

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
											<p className="whitespace-nowrap text-xs font-medium text-muted-foreground md:text-foreground">
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
									<div className={cn("flex justify-center items-center rounded-lg px-1 min-h-full relative min-w-14 border")}>
										<p className="text-xs text-muted-foreground font-mono">{formatSecondsToMMSS(player_game.seconds)}</p>
										{
											player_game.game.status_code == 2 && 
											<span className="absolute right-2 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
										}
									</div>

									{/* Counting stats */}
									<div className="h-full items-center grid grid-cols-6 rounded-lg min-w-70 py-0.5 border">
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

											return (
												<div key={index} className={cn(
													"col-span-1 w-full flex flex-col gap-0.5 justify-between items-end px-1 py-1 rounded-lg"
												)}>
													<div className="w-full flex justify-start items-end gap-0.5">
														<div className="text-sm font-semibold leading-none">{stat.value}</div> 
														<span className="text-[0.5rem] leading-none text-muted-foreground uppercase tracking-wider">{stat.label}</span>
													</div>
													{ showMoreData &&
														<div className={cn("w-full flex items-center justify-start")} 
															style={{ 
																color: valueToRGB({ value: scaledDelta, min: -0.75, max: 0.75, midColor: [180, 180, 180, 0.5] }),
															}} 
														>
															<span className="text-[10px] font-medium leading-none">
																{Math.abs(delta).toFixed(1)}
																{/* {scaledDelta.toFixed(1)} */}
															</span>
															<Icon className="w-3 h-3" />
														</div>
													}
												</div>
											)})}
									</div>

									{/* FP */}
									<div
										className="flex h-full justify-end items-center rounded-lg min-w-16 p-1"
										style={{ backgroundColor: valueToRGB({ value: player_game.fp, min: 10, max: 60 }) }}
									>
										<div className="flex items-end gap-0.5">
											<div className="text-sm leading-none font-semibold text-white drop-shadow-sm">{player_game.fp.toFixed(1)}</div>
											<span className="text-[0.5rem] leading-none text-white/80 font-medium uppercase">fp</span>
										</div>
									</div>

									{/* FP Delta */}
									<div className="h-full flex justify-end items-center rounded-lg min-w-16 p-1 border">
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
											{ made: player_game.three_pointers_made, attempted: player_game.three_pointers_attempted, percentage: player_game.three_pointers_percentage, label: '3p', low: 0.25, mid: 0.36, high: 0.60, attemptThreshold: 10},
											{ made: player_game.free_throws_made, attempted: player_game.free_throws_attempted, percentage: player_game.free_throws_percentage, label: 'ft', low: 0.6, mid: 0.8, high: 1.0, attemptThreshold: 10 },
										].map((stat, index) => (

											<div key={index} 
												className={cn("col-span-1 w-full flex flex-col gap-0.5 justify-between items-end px-1 py-1 rounded-lg border")}
												
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
										))}
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