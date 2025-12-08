'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { getPerformanceFlags } from "@/lib/player-performance-flags";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { formatSecondsToMMSS, valueToRGB } from "@/lib/utils";
import { DotIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";


export function PlayerRankingsGrid({ gamePlayers }: { gamePlayers: any[] }) {
	const [rowData, setRowData] = useState<any[]>([]);
	
	const [showImage, setShowImage] = useState<Boolean>(false)
	const [shortName, setShortName] = useState<Boolean>(false)
	const [showPercentages, setShowPercentages] = useState<Boolean>(true)
	const [showVolume, setShowVolume] = useState<boolean>(true)

    // Sorting state
    const [sortField, setSortField] = useState<string>("fp");
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
                        if (avg === 0) return -999; // Treat no avg as low value?
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
		<div className="w-full max-w-6xl flex flex-col gap-4">
			<div className="flex items-center gap-6 p-1 justify-between">
                <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="show-percentages" 
                            checked={showPercentages as boolean}
                            onCheckedChange={(checked) => setShowPercentages(checked as boolean)}
                        />
                        <Label htmlFor="show-percentages">Show Percentages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="show-volume" 
                            checked={showVolume}
                            onCheckedChange={(checked) => setShowVolume(checked as boolean)}
                        />
                        <Label htmlFor="show-volume">Show Volume</Label>
                    </div>
                </div>

                <div className="flex items-center gap-2 max-w-full overflow-x-scroll px-2">
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
			</div>
			
			<div className="overflow-x-auto w-full pb-4">
				<div className="min-w-max flex flex-col gap-2">
				{
					rowData.map((player_game, index) => {

						const playerName = `${player_game.player.first_name} ${player_game.player.last_name}`;

						return (
							<div className="flex flex-col p-0 rounded-xl" key={player_game.player.id}>
								<div className="w-full flex gap-2">
									
									{/* Sticky Player Details Column */}
									<div className="sticky left-0 z-10 flex items-center">

										<div className="w-40 md:w-50 h-full flex items-center  bg-linear-to-r from-background via-background to-background/0">
											<p className="text-sm text-muted-foreground/50 mr-2">{index + 1}</p>
											
											{/* Player Image */}
											{ showImage && 
												<div className="relative rounded-md overflow-hidden min-w-10 h-16 flex-shrink-0">
													<Image
														src={playerHeadshotURL(player_game.player.id)}
														alt={playerName}
														layout="fill"
														objectFit="cover"
													/>
												</div>
											}

											{/* Player Name & Team */}
											<div className="flex h-fit items-center gap-2 text-muted-foreground">
												{/* <p className="ml-2 whitespace-nowrap truncate text-sm font-medium text-foreground font-stretch-75% md:font-stretch-normal">
													{shortName ? player_game.player.first_name[0] + ". " + player_game.player.last_name : player_game.player.first_name + " " + player_game.player.last_name}
												</p> */}
												<div className="flex flex-col md:flex-row items-start md:items-center md:gap-1">
													<p className="whitespace-nowrap truncate text-xs md:text-sm font-medium text-muted-foreground md:text-foreground font-stretch-75% md:font-stretch-normal">
														{player_game.player.first_name}
													</p>
													<p className="whitespace-nowrap truncate text-sm font-medium text-foreground font-stretch-75% md:font-stretch-normal">
														{player_game.player.last_name}
													</p>
												</div>
												
												<div className="flex items-center gap-1">
													<Image
														src={teamLogoURL(player_game.team.id)}
														alt={player_game.team.name}
														width={20}
														height={20}
														quality={100}
														className="opacity-80"
													/>
													{player_game.starter && 
														<div className="flex items-center gap-1 leading-none">
															<DotIcon className="w-2 h-2" />
															{/* Optional S indicator, icon might be enough */}
															<div className="text-xs leading-none text-muted-foreground/50">S</div>
														</div>
													}
												</div>
											</div>
										</div>
									</div>

									{/* Scrollable Stats Area */}
									<div className={cn("flex items-center w-full justify-end pl-2")}>

										{/* Stats */}
										<div className="w-fit max-w-full h-fit flex gap-1 md:gap-2 items-center bg-muted/30 hover:bg-muted/50 transition-colors rounded-full pr-4 md:px-1 border border-transparent hover:border-border/50">
											
											{/* Minutes */}
											<div className={cn("flex justify-center items-center rounded px-1 min-h-full relative w-14")}>
												<p className="text-xs text-muted-foreground font-mono">{formatSecondsToMMSS(player_game.seconds)}</p>
												{
													player_game.game.status_code == 2 && 
													<span className="absolute right-2 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
												}
											</div>

											{/* Counting stats */}
											<div className="h-full items-center grid grid-cols-6 rounded w-full md:w-96 p-2">
												{[
													{ value: player_game.points, label: 'pts' },
													{ value: player_game.rebounds_total, label: 'reb' },
													{ value: player_game.assists, label: 'ast' },
													{ value: player_game.steals, label: 'stl' },
													{ value: player_game.blocks, label: 'blk' },
													{ value: player_game.turnovers, label: 'tov' },
												].map((stat, index) => (
													<div key={index} className="col-span-1 w-full flex flex-col md:flex-row justify-center items-end relative gap-0.5 min-w-8 border border-transparent hover:border-blue-500 cursor-pointer">
														<div className="text-sm leading-none font-semibold">{stat.value}</div>
														<span className="text-[0.6rem] leading-none text-muted-foreground uppercase tracking-wider font-stretch-75%">{stat.label}</span>
													</div>
												))}
											</div>

											{/* FP */}
											<div
												className="flex justify-center items-center rounded-lg min-w-12 md:min-w-20 p-1"
												style={{ backgroundColor: valueToRGB({ value: player_game.fp, min: 10, max: 60 }) }}
											>
												<div className="flex flex-col md:flex-row items-end">
													<div className="text-sm leading-none font-semibold text-white drop-shadow-sm">{player_game.fp}</div>
													<span className="text-[10px] leading-none text-white/90 font-medium uppercase">fp</span>
												</div>
											</div>

											{/* FP Delta */}
											<div className="flex justify-center items-center rounded-full h-full min-w-16 py-1">
												{player_game.player.season_averages[0]?.nba_fantasy_points ? (
													(() => {
														const avg = player_game.player.season_averages[0].nba_fantasy_points;
														const delta = player_game.fp - avg; // Absolute delta
														return (
															<div className="flex flex-col md:flex-row justify-center items-end relative gap-0.5">
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
											<div className={cn("w-fit flex gap-2", (showPercentages || showVolume) ? "" : "hidden")}>
												{[
													{ made: player_game.field_goals_made, attempted: player_game.field_goals_attempted, percentage: player_game.field_goals_percentage, label: 'fg', low: 0.33, mid: 0.47, high: 0.75, attemptThreshold: 15 },
													{ made: player_game.three_pointers_made, attempted: player_game.three_pointers_attempted, percentage: player_game.three_pointers_percentage, label: '3p', low: 0.25, mid: 0.36, high: 0.60, attemptThreshold: 10},
													{ made: player_game.free_throws_made, attempted: player_game.free_throws_attempted, percentage: player_game.free_throws_percentage, label: 'ft', low: 0.6, mid: 0.8, high: 1.0, attemptThreshold: 10 },
												].map((stat, index) => (
													<div key={index} className={cn("flex flex-col md:flex-row items-end w-24 px-1 py-0.5 rounded-lg bg-background/50 border border-border/50")} style={{
														backgroundColor: `rgba(${valueToRGB({ value: stat.percentage, min: stat.low, max: stat.high }).match(/\d+/g)?.slice(0, 3).join(', ')}, ${Math.min(stat.attempted, stat.attempted) / stat.attemptThreshold})`,
													}} >
														
														<div className="flex flex-col md:flex-row items-end gap-0 md:gap-3">
															{showVolume && (
																<div className="flex flex-col items-end min-w-8">
																	<div className="text-xs font-semibold tabular-nums">
																		{stat.made}/{stat.attempted}
																	</div>
																</div>
															)}

															
														</div>
														<div className="w-full flex items-end justify-between gap-1">
															{showPercentages && (
																<div className="flex flex-col items-end min-w-9">
																	<div className="text-[10px] md:text-xs font-regular tabular-nums text-foreground" style={{
																		
																	}}>
																		{stat.attempted > 0 ? (stat.percentage * 100).toFixed(0) : "-"}%
																	</div>
																</div>
															)}
															<span className="text-[10px] uppercase text-muted-foreground font-medium">{stat.label}</span>
														</div>
													</div>
												))}
											</div>
										</div>
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
