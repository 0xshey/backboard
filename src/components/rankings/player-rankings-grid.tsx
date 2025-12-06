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

                <div className="flex items-center gap-2">
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
			
			<div className="w-full max-w-6xl flex flex-col gap-2">
			{
				rowData.map((player_game) => { // Use rowData instead of gamePlayers directly

					const playerName = `${player_game.player.first_name} ${player_game.player.last_name}`;

					return (
						<div className="flex flex-col p-0 rounded-xl" key={player_game.player.id}>
							{/* <pre>
								{JSON.stringify(player_game.player.season_averages, null, 2)}
							</pre> */}
							<div className="w-full flex gap-2">
								
								{/* Player Image */}
								{ showImage && 
									<div className="relative rounded-md overflow-hidden min-w-10 h-10">
										<Image
											src={playerHeadshotURL(player_game.player.id)}
											alt={playerName}
											layout="fill"
											objectFit="cover"
										/>
									</div>
								}

								<div className={cn("flex gap-4 w-full justify-start")}>

									{/* Player Details */}
									<div className="flex h-fit items-center gap-2 text-muted-foreground max-w-60 min-w-60 ">
										<p className="ml-2 whitespace-nowrap truncate text-sm">
											{shortName ? player_game.player.first_name[0] + ". " + player_game.player.last_name : player_game.player.first_name + " " + player_game.player.last_name}
										</p>
										
										<div className="flex items-center gap-0">
											<Image
												src={teamLogoURL(player_game.team.id)}
												alt={player_game.team.name}
												width={24}
												height={24}
												quality={100}
											/>
											{player_game.starter && 
												<>
													<DotIcon className="text-muted-foreground/20" />
													<div className="h-3 w-3 text-xs leading-none">S</div>
												</>
											}
										</div>
									</div>

									{/* Stats */}
									<div className="w-fit max-w-full h-fit flex gap-4 items-center bg-muted/50 rounded-full p-1">
										
										{/* Minutes */}
										<div className={cn("flex justify-center items-center rounded-full min-h-full gap-2 px-2 relative")}>
											<p className="text-xs text-muted-foreground">{formatSecondsToMMSS(player_game.seconds)}</p>
											{
												player_game.game.status_code == 2 && 
												<span className="absolute -translate-x-11 w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>
											}
										</div>

										{/* Counting stats */}
										<div className="h-full items-center grid grid-cols-6 rounded-full w-78">
											{[
												{ value: player_game.points, label: 'pts' },
												{ value: player_game.rebounds_total, label: 'reb' },
												{ value: player_game.assists, label: 'ast' },
												{ value: player_game.steals, label: 'stl' },
												{ value: player_game.blocks, label: 'blk' },
												{ value: player_game.turnovers, label: 'tov' },
											].map((stat, index) => (
												<div key={index} className="col-span-1 flex justify-end gap-1 items-end relative border border-transparent">
													<div className="text-sm leading-none font-semibold">{stat.value}</div>
													<span className="text-xs leading-none text-muted-foreground">{stat.label}</span>
												</div>
											))}
										</div>

										{/* FP */}
										<div
											className="flex justify-center items-center rounded-full h-full w-18 py-1"
											style={{ backgroundColor: valueToRGB({ value: player_game.fp, min: 5, max: 60 }) }}
										>
											<div className="flex gap-1 items-end">
												<div className="text-sm leading-none font-semibold">{player_game.fp}</div>
												<span className="text-xs leading-none text-foreground">fp</span>
											</div>
										</div>

										{/* FP Delta */}
										<div className="flex justify-center items-center rounded-full h-full w-14 py-1">
											{player_game.player.season_averages[0]?.nba_fantasy_points ? (
												(() => {
													const avg = player_game.player.season_averages[0].nba_fantasy_points;
													const delta = player_game.fp - avg; // Absolute delta
													return (
														<div className="flex gap-1 items-end">
															<div 
                                                                className="text-sm leading-none font-semibold"
                                                                style={{ color: valueToRGB({ value: delta + 35, min: 10, max: 60, midColor: [240, 240, 240, 1] }) }} 
                                                            >
																{delta > 0 ? "+" : ""}{delta.toFixed(1)}
															</div>
															<span className="text-xs leading-none text-muted-foreground">δ</span>
														</div>
													);
												})()
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</div>

										{/* Efficiency */}
										<div className={cn("max-w-90 w-fit", (showPercentages || showVolume) && "grid grid-cols-3")}>
											{[
												{ made: player_game.field_goals_made, attempted: player_game.field_goals_attempted, percentage: player_game.field_goals_percentage, label: 'fg' },
												{ made: player_game.three_pointers_made, attempted: player_game.three_pointers_attempted, percentage: player_game.three_pointers_percentage, label: '3p' },
												{ made: player_game.free_throws_made, attempted: player_game.free_throws_attempted, percentage: player_game.free_throws_percentage, label: 'ft' },
											].map((stat, index) => (
												<div key={index} className={cn("grid rounded-full h-fit py-1 gap-2", (showPercentages && showVolume) ? "grid-cols-2 bg-muted/50" : "grid-cols-1")} >
													{showVolume && (
														<div className="col-span-1 flex justify-end gap-1 items-end relative border border-transparent w-16">
															<div className="text-sm leading-none font-semibold">
																{stat.made}/{stat.attempted}
															</div>
															<span className="text-xs leading-none text-muted-foreground">{stat.label}</span>
														</div>
													)}

													{showPercentages && (
														<div className="col-span-1 flex justify-center gap-1 items-end relative w-18">
															<div className="text-sm leading-none font-semibold">
																{stat.attempted > 0 ? (stat.percentage * 100).toFixed(0) : "-"}%
															</div>
														<span className="text-xs leading-none text-muted-foreground">{stat.label}%</span>
													</div>
													)}
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
							{/* <div className="w-full h-full flex flex-wrap items-end gap-1 mt-2">
								{getPerformanceFlags(player_game).map((flag, index) => (
									<Badge key={index} variant="outline" className="font-normal text-muted-foreground font-semibold rounded-full whitespace-nowrap">
										{flag}
									</Badge>
								))}
							</div> */}
						</div>
					)
				})
			}
			</div>
		</div>
	)
}
