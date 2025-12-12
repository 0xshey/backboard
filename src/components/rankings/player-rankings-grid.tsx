'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { getPerformanceFlags } from "@/lib/player-performance-flags";
import { Badge } from "@/components/ui/badge";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatSecondsToMMSS, valueToRGB } from "@/lib/utils";
import { 
  DotIcon, ArrowUpIcon, ArrowDownIcon, ChevronUp, ChevronDown, 
  ChevronsUp, ChevronsDown, MoreVertical, Percent, Hash
} from "lucide-react";
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

		const sorted = [...enrichedData].sort((a, b) => {
			let valA: any = 0;
			let valB: any = 0;

			const getStatValue = (item: any, key: string) => {
				const statMap: Record<string, string> = {
					'pts': 'points',
					'reb': 'rebounds_total',
					'ast': 'assists',
					'stl': 'steals',
					'blk': 'blocks',
					'tov': 'turnovers',
					'fg': 'field_goals_percentage',
					'3p': 'three_pointers_percentage',
					'ft': 'free_throws_percentage',
				};
				return item[statMap[key] || key];
			};

			const getDeltaValue = (item: any, key: string) => {
				const statKey = key.replace('_delta', '');
				const val = getStatValue(item, statKey);
				const avgKey = statKey === 'reb' ? 'rebounds_total' : statKey; // handle slight naming diff if any
				
				// manual mapping for averages keys if they differ from game keys
				// game: points, rebounds_total, assists, steals, blocks, turnovers
				// avg: points, rebounds_total, assists, steals, blocks, turnovers
				// It seems they match mostly.
				let avgVal = 0;
				if (['pts', 'reb', 'ast', 'stl', 'blk', 'tov'].includes(statKey)) {
					// get the correct avg key
					const avgKeyMap: any = { 'pts': 'points', 'reb': 'rebounds_total', 'ast': 'assists', 'stl': 'steals', 'blk': 'blocks', 'tov': 'turnovers' };
					avgVal = item.player.season_averages[0]?.[avgKeyMap[statKey]] || 0;
				} else if (statKey === 'fp') {
					avgVal = item.player.season_averages[0]?.nba_fantasy_points || 0;
				}
				
				return val - avgVal;
			};

			// Custom comparators
			if (sortField === 'player') {
				valA = a.player.last_name.toLowerCase();
				valB = b.player.last_name.toLowerCase();
			} else if (sortField === 'minutes') {
				valA = a.seconds;
				valB = b.seconds;
			} else if (sortField.endsWith('_delta')) {
				valA = getDeltaValue(a, sortField);
				valB = getDeltaValue(b, sortField);
			} else if (sortField.endsWith('_pct')) {
                // Percentage sort (Efficiency)
                valA = getStatValue(a, sortField.replace('_pct', '')); // 'fg_pct' -> 'fg' -> logic gets pct
                valB = getStatValue(b, sortField.replace('_pct', ''));
            } else if (sortField.endsWith('_vol')) {
                // Volume sort (Attempts? or Made?) - Let's use Attempts as per standard "Volume"
                // Mapper for attempts keys
                const volMap: Record<string, string> = {
                    'fg': 'field_goals_attempted',
                    '3p': 'three_pointers_attempted',
                    'ft': 'free_throws_attempted'
                };
                const baseKey = sortField.replace('_vol', '');
                valA = a[volMap[baseKey]];
                valB = b[volMap[baseKey]];

            } else {
                // Default number sort
                valA = getStatValue(a, sortField) || a[sortField]; // Fallback
                valB = getStatValue(b, sortField) || b[sortField];
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            
            // Tie-breakers
            // 1. If sorting by Volume, tie-break with Pct
            if (sortField.endsWith('_vol')) {
                const baseKey = sortField.replace('_vol', '');
                const pctA = getStatValue(a, baseKey);
                const pctB = getStatValue(b, baseKey);
                 if (pctA !== pctB) return sortDirection === 'asc' ? (pctA < pctB ? -1 : 1) : (pctA > pctB ? -1 : 1);
            }

            if (sortField !== 'fp' && sortField !== 'fp_delta') {
                // Determine tie-breaker based on sortField
                // If sorting by Value, tie-break with Delta (same direction usually, but let's stick to simple logic or per spec)
                // "if there is a tie, sort by the delta of the stat"
                if (!sortField.endsWith('_delta') && ['pts', 'reb', 'ast', 'stl', 'blk', 'tov'].includes(sortField)) {
                    const deltaA = getDeltaValue(a, sortField + '_delta');
                    const deltaB = getDeltaValue(b, sortField + '_delta');
                    if (deltaA !== deltaB) return sortDirection === 'asc' ? (deltaA < deltaB ? -1 : 1) : (deltaA > deltaB ? -1 : 1);
                }
            }

            return 0;
        });

		setRowData(sorted);
	}, [enrichedData, sortField, sortDirection]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            // Cycle: Value Desc -> Value Asc -> (If Stat) Delta Desc -> Delta Asc -> Off/Default
            if (sortDirection === 'desc') {
                setSortDirection('asc');
            } else if (sortDirection === 'asc') {
                // Check if this field supports delta sorting
                if (['pts', 'reb', 'ast', 'stl', 'blk', 'tov', 'fp'].includes(field)) {
                    setSortField(`${field}_delta`);
                    setSortDirection('desc');
                } else if (['fg', '3p', 'ft'].includes(field)) {
                    // Efficiency Cycle: 
                    // Pct Desc (Default on 1st click) -> Pct Asc -> Vol Desc -> Vol Asc -> Default
                    // Wait, if sortField == field (which is e.g. 'fg'), we are in Pct mode (default for 'fg' logic in getStatValue returns pct)
                    // So we are in Pct Asc. Next is Vol Desc.
                    setSortField(`${field}_vol`);
                    setSortDirection('desc');
                } else {
                    // Reset to default FP sort? or just flip back to desc? 
                    // Let's just reset to simple desc for non-delta fields
                    setSortDirection('desc');
                }
            }
        } else if (sortField === `${field}_delta`) {
             // Cycle: Delta Desc -> Delta Asc -> Back to Value Desc logic?
             if (sortDirection === 'desc') {
                setSortDirection('asc');
             } else {
                 setSortField(field); // Go back to value
                 setSortDirection('desc'); 
             }
        } else if (sortField === `${field}_vol`) {
            // Volume Cycle: Vol Desc -> Vol Asc -> Back to Pct (field) Desc
            if (sortDirection === 'desc') {
                setSortDirection('asc');
            } else {
                setSortField(field);
                setSortDirection('desc');
            }
        } else {
            // New field
            setSortField(field);
            setSortDirection('desc'); // Default to high-to-low for stats
            if (field === 'player') setSortDirection('asc'); // A-Z for strings
        }
    };

	// Explicit sort setter for dropdowns
	const setSort = (field: string, dir: 'asc' | 'desc') => {
		setSortField(field);
		setSortDirection(dir);
	};

	    // Sort options type
    type SortOption = { label: string, value: string, icon?: any };

    const ColumnHeader = ({ 
        label, 
        field, 
        hasDelta, 
        currentSortField,
        currentSortDirection,
        onSort,
        onExplicitSort,
        className,
        extraOptions = []
    }: {
        label: string, 
        field: string, 
        hasDelta?: boolean, 
        currentSortField: string,
        currentSortDirection: 'asc' | 'desc',
        onSort: (field: string) => void,
        onExplicitSort: (field: string, dir: 'asc' | 'desc') => void,
        className?: string,
        extraOptions?: SortOption[]
    }) => {
        // Active check handles base field, delta field, and any extra options (like fg_vol, fg_pct etc if they follow pattern)
        // Ideally we just check if currentSortField starts with field? No, field might be "pts" and sortField "pts_delta"
        const isActive = currentSortField === field || currentSortField === `${field}_delta` || currentSortField.startsWith(`${field}_`);
        const isDelta = currentSortField === `${field}_delta`;
        
        return (
            <div className={cn("h-full w-full flex justify-center items-center text-center text-sm text-muted-foreground relative group select-none", className)}>
                
                <div 
                    className={cn(
                        "flex items-center gap-1 cursor-pointer w-full h-full justify-center transition-colors text-xs hover:bg-muted/50", 
                        isActive && "text-foreground font-medium bg-muted/30"
                    )}
                    onClick={() => onSort(field)}
                >
                    {label}
                    {isActive && (
                        currentSortDirection === 'asc' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
                    )}
                     {/* Show delta indicator if sorting by delta */}
                    {isDelta && <span className="text-[10px] bg-muted-foreground/20 px-1 rounded">δ</span>}
                    {/* Show Vol/Pct indicator if sorting by efficiency variants */}
                    {currentSortField.endsWith('_vol') && <Hash className="w-3 h-3 text-muted-foreground" />}
                    {currentSortField.endsWith('_pct') && <Percent className="w-3 h-3 text-muted-foreground" />}
                </div>

                {/* Dropdown Trigger - shows on hover or if active */}
                <div className={cn("absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity", isActive && "opacity-50")}>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onExplicitSort(field, 'desc')}>
                                <ArrowDownIcon className="mr-2 h-3 w-3" /> Sort Value High-Low
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExplicitSort(field, 'asc')}>
                                 <ArrowUpIcon className="mr-2 h-3 w-3" /> Sort Value Low-High
                            </DropdownMenuItem>
                            {hasDelta && (
                                <>
                                    <DropdownMenuItem onClick={() => onExplicitSort(`${field}_delta`, 'desc')}>
                                        <ArrowDownIcon className="mr-2 h-3 w-3" /> Sort Delta High-Low
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onExplicitSort(`${field}_delta`, 'asc')}>
                                        <ArrowUpIcon className="mr-2 h-3 w-3" /> Sort Delta Low-High
                                    </DropdownMenuItem>
                                </>
                            )}
                            {extraOptions.map((opt) => (
                                <DropdownMenuItem key={opt.value} onClick={() => onExplicitSort(opt.value, 'desc')}>
                                     <ArrowDownIcon className="mr-2 h-3 w-3" /> Sort {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        )
    };

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
				<div className="w-full h-full border flex items-center gap-1 px-0.5 pb-2 mb-2">
					<ColumnHeader 
						label="Player" 
						field="player" 
						currentSortField={sortField} 
						currentSortDirection={sortDirection} 
						onSort={handleSort} 
						onExplicitSort={setSort}
						className="sticky left-0 z-20 text-left justify-start pl-2 min-w-50 max-w-50 bg-background"
					/>
					<ColumnHeader 
						label="Min" 
						field="minutes" 
						currentSortField={sortField} 
						currentSortDirection={sortDirection} 
						onSort={handleSort} 
						onExplicitSort={setSort}
						className="min-w-14"
					/>
					<div className="min-w-70 grid grid-cols-6 gap-0">
						{['pts', 'reb', 'ast', 'stl', 'blk', 'tov'].map(stat => (
								<ColumnHeader 
								key={stat}
								label={stat.toUpperCase()} 
								field={stat} 
								hasDelta={true}
								currentSortField={sortField} 
								currentSortDirection={sortDirection} 
								onSort={handleSort} 
								onExplicitSort={setSort}
							/>
						))}
					</div>
					<ColumnHeader 
						label="FP" 
						field="fp" 
						hasDelta={true}
						currentSortField={sortField} 
						currentSortDirection={sortDirection} 
						onSort={handleSort} 
						onExplicitSort={setSort}
						className="min-w-16"
					/>
					<ColumnHeader 
						label="FPδ" 
						field="fp_delta" 
						currentSortField={sortField} 
						currentSortDirection={sortDirection} 
						onSort={handleSort} 
						onExplicitSort={setSort}
						className="min-w-16"
					/>
					<div className="min-w-60 grid grid-cols-3 gap-0">
						{['fg', '3p', 'ft'].map(stat => (
							<ColumnHeader 
							key={stat}
							label={stat.toUpperCase()} 
							field={stat} 
							currentSortField={sortField} 
							currentSortDirection={sortDirection} 
							onSort={handleSort} 
							onExplicitSort={setSort}
							extraOptions={[
								{ label: 'Volume', value: `${stat}_vol` },
							]}
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
									<p className="text-sm text-muted-foreground/50 mr-2 min-w-[20px] text-right">{player_game.fpRank}</p>

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