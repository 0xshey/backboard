"use client";

import { useEffect, useState } from "react";
import { useGameCache } from "@/components/providers/game-cache-provider";
import { GameLog } from "@/types";
import { valueToRGB, cn } from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface GameBreakdownProps {
	playerId: string;
}

export function GameBreakdown({ playerId }: GameBreakdownProps) {
	const { getGameLogs } = useGameCache();
	const [gameLogs, setGameLogs] = useState<GameLog[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchGames = async () => {
			setLoading(true);
			try {
				const data = await getGameLogs(playerId);
				setGameLogs(data);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchGames();
	}, [playerId, getGameLogs]);

	if (loading) {
		return (
			<div className="p-4 text-sm text-muted-foreground animate-pulse">
				Loading game history...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 text-sm text-red-500">
				Error loading games: {error}
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden py-2">
			<div className="flex items-end gap-2 overflow-x-auto pb-4 px-1 pl-4 scrollbar-hide">
				{gameLogs?.map((log) => {
					const date = log.game?.datetime
						? new Date(log.game.datetime)
						: new Date();
					const fpValue = log.fp ?? 0;
					const color = valueToRGB({
						value: fpValue,
						midColor: [200, 200, 200, 1],
					});
					const played = log.played;

					return (
						<div
							key={log.game_id}
							className="flex flex-col items-center gap-1 flex-shrink-0"
						>
							<span className="text-[10px] text-muted-foreground font-sans tracking-wide">
								{date.toLocaleDateString(undefined, {
									month: "numeric",
									day: "numeric",
								})}
							</span>
							<Popover>
								<PopoverTrigger asChild>
									<div
										className={cn(
											"min-w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95 border bg-muted/30"
										)}
										style={{
											color: "white",
											backgroundColor: played
												? color
												: "transparent",
										}}
									>
										{played ? (
											<span className="font-medium text-xs">
												{fpValue.toFixed(0)}
											</span>
										) : (
											<span className="font-medium text-xs font-stretch-70% text-muted-foreground">
												DNP
											</span>
										)}
									</div>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-4"
									side="top"
								>
									<div className="flex flex-col gap-2">
										<div className="flex items-center justify-between gap-4 border-b pb-2">
											<div className="flex flex-col">
												<span className="text-xs text-muted-foreground">
													vs{" "}
													{log.opp_team?.tricode ??
														"N/A"}
												</span>
												<span className="text-[10px] text-muted-foreground/50">
													{format(date, "PPP")}
												</span>
											</div>
											<div
												className="text-lg font-bold"
												style={{ color: color }}
											>
												{fpValue.toFixed(1)} FP
											</div>
										</div>
										<div className="grid grid-cols-4 gap-x-4 gap-y-2 text-xs">
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.seconds
														? Math.floor(
																log.seconds / 60
														  )
														: 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													MIN
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.points ?? 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													PTS
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.rebounds_total ?? 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													REB
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.assists ?? 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													AST
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.steals ?? 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													STL
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.blocks ?? 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													BLK
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.turnovers ?? 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													TO
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="font-mono font-bold text-foreground">
													{log.fouls_personal ?? 0}
												</span>
												<span className="text-[10px] text-muted-foreground">
													PF
												</span>
											</div>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					);
				})}
			</div>
		</div>
	);
}
