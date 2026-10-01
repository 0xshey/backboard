import Image from "next/image";
import Link from "next/link";
import { formatSecondsToMMSS, cn } from "@/lib/utils";
import { getContrastingColor, valueToRGB } from "@/lib/value-to-color";
import { teamLogoURL } from "@/lib/image-urls";
import { TableRow, TableCell } from "@/components/ui/table";

/**
 * Shooting efficiency color config.
 * Percentage determines color direction (red ↔ green).
 * Volume (attempts) determines color intensity (alpha).
 *
 * Adjust these values to tune the color thresholds:
 */
const SHOOTING_CONFIG = {
	fg: {
		lowPct: 0.35, // deep red below this
		midPct: 0.47, // NBA average — neutral point
		highPct: 0.65, // deep green above this
		volumeBaseline: 12, // typical FGA for a meaningful sample
	},
	"3p": {
		lowPct: 0.2, // deep red below this
		midPct: 0.36, // NBA average — neutral point
		highPct: 0.5, // deep green above this
		volumeBaseline: 6, // typical 3PA for a meaningful sample
	},
	ft: {
		lowPct: 0.55, // deep red below this
		midPct: 0.78, // NBA average — neutral point
		highPct: 0.95, // deep green above this
		volumeBaseline: 5, // typical FTA for a meaningful sample
	},
	maxAlpha: 0.35, // max background opacity when volume is at or above cap
	volumeCap: 2.0, // volume scales linearly up to this multiple of baseline
} as const;

interface PlayerRankingRowProps {
	player_game: any;
	sortField: string;
}

export function PlayerRankingRow({
	player_game,
	sortField,
}: PlayerRankingRowProps) {
	const isPlayerSort = sortField === "player";

	const countingStats = [
		{ value: player_game.points, label: "pts" },
		{ value: player_game.rebounds_total, label: "reb" },
		{ value: player_game.assists, label: "ast" },
		{ value: player_game.steals, label: "stl" },
		{ value: player_game.blocks, label: "blk" },
		{ value: player_game.turnovers, label: "tov" },
	];

	const efficiencyStats = [
		{
			made: player_game.field_goals_made,
			attempted: player_game.field_goals_attempted,
			percentage: player_game.field_goals_percentage,
			label: "fg" as const,
		},
		{
			made: player_game.three_pointers_made,
			attempted: player_game.three_pointers_attempted,
			percentage: player_game.three_pointers_percentage,
			label: "3p" as const,
		},
		{
			made: player_game.free_throws_made,
			attempted: player_game.free_throws_attempted,
			percentage: player_game.free_throws_percentage,
			label: "ft" as const,
		},
	];

	// FP delta
	const seasonAvgFp =
		player_game.player.season_averages?.[0]?.nba_fantasy_points;
	const fpDelta = seasonAvgFp ? player_game.fp - seasonAvgFp : null;

	// FP per minute
	const minutes = player_game.seconds / 60;
	const fpPerMin = minutes > 0 ? player_game.fp / minutes : null;

	return (
		// ↓ Change text-sm to adjust the size of all stat values in the row
		<TableRow className="text-base py-1 hover:bg-muted/30 transition-colors h-9 md:h-10 border-b border-border/50">
			{/* Player (sticky) */}
			<TableCell className="sticky left-0 z-10 bg-background p-0 min-w-24 md:min-w-72">
				<div className="flex items-center gap-2 px-1 md:px-2 h-full">
					<span className="text-xs text-muted-foreground/50 min-w-4 text-right tabular-nums">
						{player_game.fpRank}
					</span>
					<Image
						src={teamLogoURL(player_game.team.id)}
						alt={player_game.team.name}
						width={24}
						height={24}
						quality={100}
						className="opacity-80 shrink-0 hidden md:block"
					/>
					{/* ↓ Change text-xs to adjust the player name size */}
					<Link
						href={`/player/${player_game.player.id}`}
						className="text-xs md:text-base flex flex-col md:flex-row items-start md:items-center md:gap-1 min-w-0 hover:opacity-70 transition-opacity"
					>
						<span
							className={cn(
								"truncate text-muted-foreground",
								isPlayerSort && "opacity-50",
								player_game.player.first_name.length >= 9 &&
									"font-stretch-75% md:font-stretch-100%",
							)}
						>
							{player_game.player.first_name}
						</span>
						<span
							className={cn(
								"truncate text-foreground",
								player_game.player.last_name.length >= 9 &&
									"font-stretch-75% md:font-stretch-100%",
							)}
						>
							{player_game.player.last_name}
						</span>
					</Link>
				</div>
			</TableCell>

			{/* Minutes */}
			<TableCell className="text-center p-1">
				<div className="flex flex-col items-end justify-center gap-0.5 relative">
					{/* Live indicator */}
					{player_game.game?.status_code === 2 && (
						<div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse absolute -left-0.5 top-0.5" />
					)}
					<span className="font-semibold leading-none tabular-nums text-muted-foreground">
						{formatSecondsToMMSS(player_game.seconds).split(":")[0]}
					</span>
				</div>
			</TableCell>

			{/* Counting stats */}
			{countingStats.map((stat) => {
				const isSortedByDelta = sortField === `${stat.label}_delta`;
				return (
					<TableCell key={stat.label} className="">
						<div className="flex flex-col items-end justify-center gap-0.5">
							<span
								className={cn(
									"font-semibold leading-none",
									isSortedByDelta &&
										"text-muted-foreground opacity-70 font-normal",
								)}
							>
								{stat.value}
							</span>
						</div>
					</TableCell>
				);
			})}

			{/* FP */}
			<TableCell className="p-0.5 pl-3">
				<div
					className="flex flex-col items-end justify-center gap-0 pl-3 p-1 rounded-md h-full"
					style={{
						backgroundColor: valueToRGB({
							value: player_game.fp,
							schema: "fantasyPoints",
						}),
						color: getContrastingColor(
							valueToRGB({
								value: player_game.fp,
								schema: "fantasyPoints",
							}),
						),
					}}
				>
					<span className="leading-none font-semibold tabular-nums drop-shadow-sm">
						{player_game.fp.toFixed(1)}
					</span>
				</div>
			</TableCell>

			{/* FP Delta */}
			<TableCell className="text-center p-1">
				{fpDelta !== null ? (
					<div className="flex flex-col items-end justify-center gap-0">
						<span
							className="leading-none font-semibold tabular-nums"
							style={{
								color: valueToRGB({
									value: fpDelta,
									min: -40,
									max: 40,
									midColor: [200, 200, 200, 1],
								}),
							}}
						>
							{fpDelta > 0 ? "+" : ""}
							{fpDelta.toFixed(1)}
						</span>
					</div>
				) : (
					<span className="text-muted-foreground text-xs">-</span>
				)}
			</TableCell>

			{/* FP / MIN */}
			<TableCell className="text-center p-1">
				{fpPerMin !== null ? (
					<div className="flex flex-col items-end justify-center gap-0">
						<span
							className="leading-none font-semibold tabular-nums"
							style={{
								color: valueToRGB({
									value: fpPerMin,
									min: 0.5,
									max: 2.5,
									midColor: [200, 200, 200, 1],
								}),
							}}
						>
							{fpPerMin.toFixed(2)}
						</span>
					</div>
				) : (
					<span className="text-muted-foreground text-xs">-</span>
				)}
			</TableCell>

			{/* Efficiency: FG, 3P, FT */}
			{efficiencyStats.map((stat) => {
				const cfg = SHOOTING_CONFIG[stat.label];
				const volumeScale =
					Math.min(
						stat.attempted / cfg.volumeBaseline,
						SHOOTING_CONFIG.volumeCap,
					) / SHOOTING_CONFIG.volumeCap;
				const alpha = SHOOTING_CONFIG.maxAlpha * volumeScale;

				return (
					<TableCell key={stat.label} className="p-0.5 pl-3">
						<div
							className="flex flex-col items-end justify-center gap-0 p-1 rounded-md h-full"
							style={{
								backgroundColor: valueToRGB({
									value: stat.percentage,
									min: cfg.lowPct,
									max: cfg.highPct,
									lowColor: [192, 11, 35, alpha],
									midColor: [0, 0, 0, 0],
									highColor: [43, 168, 74, alpha],
								}),
							}}
						>
							<span className="font-semibold leading-none tabular-nums">
								{stat.made}/{stat.attempted}
							</span>
						</div>
					</TableCell>
				);
			})}
		</TableRow>
	);
}
