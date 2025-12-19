import Image from "next/image";
import { formatSecondsToMMSS, valueToRGB, cn } from "@/lib/utils";
import { teamLogoURL } from "@/lib/image-urls";
import { ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from "lucide-react";
import {
	COLUMN_WIDTHS,
	RANKINGS_GRID_DEBUG as DEBUG,
} from "./player-rankings-grid";

interface PlayerRankingRowProps {
	player_game: any;
	showMoreData: boolean;
	sortField: string;
}

export function PlayerRankingRow({
	player_game,
	showMoreData,
	sortField,
}: PlayerRankingRowProps) {
	const playerName = `${player_game.player.first_name} ${player_game.player.last_name}`;
	// Visual dimming for First Name if sorting by Player
	const isPlayerSort = sortField === "player";

	return (
		<div
			className={cn(
				"flex items-center gap-1 h-9 md:h-10 border hover:bg-muted/30 transition-colors group/row rounded-xl",
				showMoreData && "h-11 md:h-12",
				!DEBUG && "border-transparent"
			)}
		>
			{/* COLUMN: Player Details Header */}
			<div
				className={cn(
					"sticky left-0 z-10 ",
					"overflow-x-hidden h-full flex items-center px-0 md:px-2",
					"rounded-lg border cursor-pointer hover:border-border transition-colors backdrop-blur-sm",
					COLUMN_WIDTHS.player,
					!DEBUG && "border-transparent"
				)}
			>
				<p className="text-xs md:text-sm text-muted-foreground/50 mr-2 min-w-4 text-right">
					{player_game.fpRank}
				</p>

				{/* Player Name & Team */}
				<div className="flex h-full items-center gap-2 text-muted-foreground py-1 w-full">
					<div className="min-w-4 items-center gap-1">
						<Image
							src={teamLogoURL(player_game.team.id)}
							alt={player_game.team.name}
							width={30}
							height={30}
							quality={100}
							className="opacity-80"
						/>
					</div>

					<div className="w-full flex flex-col md:flex-row items-start md:items-center md:gap-1">
						<p
							className={cn(
								"text-xs md:text-base font-medium max-w-16 truncate text-muted-foreground md:text-foreground",
								isPlayerSort && "opacity-50",
								player_game.player.first_name.length >= 9 &&
									"font-stretch-75% md:font-stretch-100%"
							)}
						>
							{player_game.player.first_name}
						</p>
						<p
							className={cn(
								"text-xs md:text-base font-medium max-w-16 truncate text-foreground",
								player_game.player.last_name.length >= 9 &&
									"font-stretch-75% md:font-stretch-100%"
							)}
						>
							{player_game.player.last_name}
						</p>
					</div>
				</div>
			</div>

			{/* Scrollable row content */}
			<div className={cn("flex items-center gap-1 h-full")}>
				{/* Minutes */}
				<div
					className={cn(
						"flex justify-center items-center rounded-lg min-h-full relative border transition-colors cursor-pointer",
						COLUMN_WIDTHS.minutes,
						player_game.game.status_code == 2 && "border-red-500",
						!DEBUG && "border-transparent"
					)}
				>
					<p className="text-xs md:text-sm text-muted-foreground font-mono">
						{formatSecondsToMMSS(player_game.seconds)}
					</p>
				</div>

				{/* Counting stats */}
				<div
					className={cn(
						"h-full items-center jusitfy-center grid grid-cols-6 rounded-lg",
						COLUMN_WIDTHS.stats
					)}
				>
					{[
						{
							value: player_game.points,
							label: "pts",
							avg: player_game.player.season_averages?.[0]
								?.points,
							r: 10,
						},
						{
							value: player_game.rebounds_total,
							label: "reb",
							avg: player_game.player.season_averages?.[0]
								?.rebounds_total,
							r: 4,
						},
						{
							value: player_game.assists,
							label: "ast",
							avg: player_game.player.season_averages?.[0]
								?.assists,
							r: 3,
						},
						{
							value: player_game.steals,
							label: "stl",
							avg: player_game.player.season_averages?.[0]
								?.steals,
							r: 2,
						},
						{
							value: player_game.blocks,
							label: "blk",
							avg: player_game.player.season_averages?.[0]
								?.blocks,
							r: 2,
						},
						{
							value: player_game.turnovers,
							label: "tov",
							avg: player_game.player.season_averages?.[0]
								?.turnovers,
							r: 2,
							invertColor: true,
						},
					].map((stat, index) => {
						const delta = stat.avg ? stat.value - stat.avg : 0;
						const isPositive = delta > 0;

						const pctDiff =
							(stat.avg ? delta / stat.avg : 0) *
							(stat.label == "tov" ? -1 : 1);
						const scaledDelta = delta / stat.r;

						const isLargeDiff = pctDiff > 0.75;
						let Icon;
						Icon = isPositive
							? isLargeDiff
								? ChevronsUp
								: ChevronUp
							: isLargeDiff
							? ChevronsDown
							: ChevronDown;

						// Visual Swap Logic
						const isSortedByThisDelta =
							sortField === `${stat.label}_delta`;

						return (
							<div
								key={index}
								className={cn(
									"col-span-1 w-full h-full flex flex-col gap-0.5 justify-center items-end px-1 py-1 rounded-lg border hover:bg-muted transition-colors cursor-pointer",
									!DEBUG && "border-transparent"
								)}
							>
								{/* Value Row */}
								<div className="w-full flex justify-start items-end gap-0.5">
									<div
										className={cn(
											"text-sm md:text-base font-semibold leading-none",
											isSortedByThisDelta &&
												"text-xs text-muted-foreground opacity-70 font-normal"
										)}
									>
										{stat.value}
									</div>
									<span className="text-[0.5rem] md:text-[0.6rem] leading-none text-muted-foreground uppercase tracking-wider">
										{stat.label}
									</span>
								</div>

								{/* Delta / Info Row */}
								{showMoreData && (
									<div
										className={cn(
											"w-full flex items-center justify-start"
										)}
										style={{
											color: valueToRGB({
												value: stat.invertColor
													? scaledDelta * -1
													: scaledDelta,
												min: -0.75,
												max: 0.75,
												midColor: [180, 180, 180, 0.5],
											}),
										}}
									>
										<span
											className={cn(
												"text-[10px] md:text-xs font-medium leading-none",
												isSortedByThisDelta &&
													"text-sm md:text-base font-bold"
											)}
										>
											{Math.abs(delta).toFixed(1)}
										</span>
										<Icon
											className={cn(
												"w-3 h-3",
												isSortedByThisDelta &&
													"w-4 h-4 stroke-[3px]"
											)}
										/>
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* FP */}
				<div
					className={cn(
						"flex h-full justify-end items-center rounded-lg p-1 border border-transparent hover:border-white/50 cursor-pointer",
						COLUMN_WIDTHS.fp
					)}
					style={{
						backgroundColor: valueToRGB({
							value: player_game.fp,
							min: 10,
							max: 60,
						}),
					}}
				>
					<div className="flex items-end gap-0.5">
						<div className="text-sm md:text-base leading-none font-semibold text-white drop-shadow-sm">
							{player_game.fp.toFixed(1)}
						</div>
						<span className="text-[0.5rem] leading-none text-white/80 font-medium uppercase">
							fp
						</span>
					</div>
				</div>

				{/* FP Delta */}
				<div
					className={cn(
						"h-full flex justify-end items-center rounded-lg p-1 border border-transparent hover:border-border transition-colors cursor-pointer",
						COLUMN_WIDTHS.fp_delta
					)}
				>
					{player_game.player.season_averages[0]
						?.nba_fantasy_points ? (
						(() => {
							const avg =
								player_game.player.season_averages[0]
									.nba_fantasy_points;
							const delta = player_game.fp - avg; // Absolute delta
							return (
								<div className="flex justify-end items-end relative gap-0.5">
									<div
										className="text-sm md:text-base leading-none font-semibold tabular-nums"
										style={{
											color: valueToRGB({
												value: delta,
												min: -40,
												max: 40,
												midColor: [200, 200, 200, 1],
											}),
										}}
									>
										{delta > 0 ? "+" : ""}
										{delta.toFixed(1)}
									</div>
									<span className="text-[10px] leading-none text-muted-foreground tracking-wider uppercase">
										δ
									</span>
								</div>
							);
						})()
					) : (
						<span className="text-muted-foreground text-xs">-</span>
					)}
				</div>

				{/* Efficiency */}
				<div
					className={cn(
						"h-full grid grid-cols-3 gap-1",
						COLUMN_WIDTHS.efficiency
					)}
				>
					{[
						{
							made: player_game.field_goals_made,
							attempted: player_game.field_goals_attempted,
							percentage: player_game.field_goals_percentage,
							label: "fg",
							low: 0.33,
							mid: 0.47,
							high: 0.75,
							attemptThreshold: 15,
						},
						{
							made: player_game.three_pointers_made,
							attempted: player_game.three_pointers_attempted,
							percentage: player_game.three_pointers_percentage,
							label: "3p",
							low: 0.25,
							mid: 0.36,
							high: 0.6,
							attemptThreshold: 8,
						},
						{
							made: player_game.free_throws_made,
							attempted: player_game.free_throws_attempted,
							percentage: player_game.free_throws_percentage,
							label: "ft",
							low: 0.6,
							mid: 0.8,
							high: 1.0,
							attemptThreshold: 10,
						},
					].map((stat, index) => {
						const significance =
							stat.percentage *
							(stat.attempted / stat.attemptThreshold);
						return (
							<div
								key={index}
								className={cn(
									"col-span-1 w-full h-full flex flex-col gap-0.5 justify-center items-end px-1 py-1 rounded-lg border-2 hover:border-border transition-colors cursor-pointer"
								)}
								style={{
									borderColor: valueToRGB({
										value: significance,
										min: 0,
										max: 1,
									}),
									backgroundColor: valueToRGB({
										value: stat.percentage,
										min: stat.low,
										max: stat.high,
										lowColor: [192, 11, 35, 0.3], // red
										midColor: [0, 0, 0, 0], // transparent
										highColor: [43, 168, 74, 0.3], // green
									}),
								}}
							>
								<div className="w-full flex justify-end items-end gap-0.5">
									<div className="text-sm md:text-base font-semibold leading-none">
										{stat.made}/{stat.attempted}
										{/* <span>{significance.toFixed(2)}</span> */}
									</div>
									<span className="text-[0.5rem] leading-none text-muted-foreground uppercase tracking-wider">
										{stat.label}
									</span>
								</div>
								{showMoreData && (
									<div
										className={cn(
											"w-full flex items-center justify-end"
										)}
									>
										<span className="text-[10px] md:text-xs font-medium leading-none">
											{stat.attempted > 0
												? (
														stat.percentage * 100
												  ).toFixed(0)
												: "-"}
											%
										</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
