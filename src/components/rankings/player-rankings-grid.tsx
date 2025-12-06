'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { getPerformanceFlags } from "@/lib/player-performance-flags";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatSecondsToMMSS, valueToRGB } from "@/lib/utils";
import { DotIcon } from "lucide-react";
import { cn } from "@/lib/utils";


export function PlayerRankingsGrid({ gamePlayers }: { gamePlayers: any[] }) {
	const [rowData, setRowData] = useState<any[]>([]);
	
	const [showImage, setShowImage] = useState<Boolean>(false)
	const [shortName, setShortName] = useState<Boolean>(false)
	const [showPercentages, setShowPercentages] = useState<Boolean>(true)
	const [showVolume, setShowVolume] = useState<boolean>(true)

	useEffect(() => {
		gamePlayers.sort((a, b) => b.fp - a.fp);
		setRowData(gamePlayers);
	}, [gamePlayers]);

	return (
		<div className="w-full max-w-6xl flex flex-col gap-4">
			<div className="flex items-center gap-6 p-1">
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
			
			<div className="w-full max-w-6xl flex flex-col gap-2">
			{
				gamePlayers.map((player_game) => {

					const playerName = `${player_game.player.first_name} ${player_game.player.last_name}`;

					return (
						<div className="flex flex-col p-0 rounded-xl" key={player_game.player.id}>
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

										{/* Efficiency */}
										<div className="grid grid-cols-3 gap-4 w-54">
											{[
												{ made: player_game.field_goals_made, attempted: player_game.field_goals_attempted, percentage: player_game.field_goals_percentage, label: 'fg' },
												{ made: player_game.three_pointers_made, attempted: player_game.three_pointers_attempted, percentage: player_game.three_pointers_percentage, label: '3p' },
												{ made: player_game.free_throws_made, attempted: player_game.free_throws_attempted, percentage: player_game.free_throws_percentage, label: 'ft' },
											].map((stat, index) => (
												<div key={index} className={cn("grid rounded-full h-fit py-1", (showPercentages && showVolume) ? "grid-cols-2 bg-muted/50" : "grid-cols-1")} >
													{showVolume && (
														<div className="col-span-1 flex justify-end gap-1 items-end relative border border-transparent">
															<div className="text-sm leading-none font-semibold">
																{stat.made}/{stat.attempted}
															</div>
															<span className="text-xs leading-none text-muted-foreground">{stat.label}</span>
														</div>
													)}
													{(!showVolume && !showPercentages) && (
														<div className="col-span-1 flex justify-center gap-1 items-end relative">
															<span className="text-xs leading-none text-muted-foreground">-</span>
														</div>
													)}

													{showPercentages && (
														<div className="col-span-1 flex justify-center gap-1 items-end relative">
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
