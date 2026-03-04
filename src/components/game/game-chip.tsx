import Image from "next/image";
import { Clock } from "lucide-react";
import { teamLogoURL } from "@/lib/image-urls";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamStanding } from "@/app/(app)/rankings/functions";

interface GameChipProps {
	game?: any;
	loading?: boolean;
	standings?: Record<string, TeamStanding>;
}

function ordinal(n: number): string {
	const v = n % 100;
	if (v >= 11 && v <= 13) return `${n}th`;
	switch (n % 10) {
		case 1:
			return `${n}st`;
		case 2:
			return `${n}nd`;
		case 3:
			return `${n}rd`;
		default:
			return `${n}th`;
	}
}

// "W3" → { ordinalRank: "3rd", conf: "West", num: 3 }
function parseRank(
	confRank: string | null,
): { ordinalRank: string; conf: string; num: number } | null {
	if (!confRank) return null;
	const prefix = confRank[0];
	const num = parseInt(confRank.slice(1), 10);
	if (isNaN(num)) return null;
	const conf = prefix === "W" ? "West" : prefix === "E" ? "East" : null;
	if (!conf) return null;
	return { ordinalRank: ordinal(num), conf, num };
}

function rankColor(num: number): string {
	if (num >= 1 && num <= 6) return "text-green-500/40";
	if (num >= 7 && num <= 10) return "text-orange-500/40";
	return "text-muted-foreground/50";
}

export function GameChip({ game, loading, standings = {} }: GameChipProps) {
	if (loading) {
		return <Skeleton className="w-full h-[88px] rounded-xl" />;
	}

	const isUpcoming = game.status_code === 1;
	const isLive = game.status_code === 2;
	const hasScores = !isUpcoming;

	const winner = hasScores
		? game.team_away_score > game.team_home_score
			? "away"
			: game.team_home_score > game.team_away_score
				? "home"
				: "tied"
		: "tied";

	// Countdown for upcoming games (only if < 24 h away)
	let countdown: string | null = null;
	let countdownUrgent = false;
	if (isUpcoming && game.datetime) {
		const diffMs = new Date(game.datetime).getTime() - Date.now();
		if (diffMs > 0 && diffMs < 24 * 60 * 60 * 1000) {
			const h = Math.floor(diffMs / (1000 * 60 * 60));
			const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
			countdown = h > 0 ? `${h}h ${m}m` : `${m}m`;
			countdownUrgent = h === 0;
		}
	}

	const teams = [
		{
			team: game.away_team,
			score: game.team_away_score,
			side: "away" as const,
		},
		{
			team: game.home_team,
			score: game.team_home_score,
			side: "home" as const,
		},
	];

	return (
		<div
			className={`w-full border rounded-xl px-2 py-2.5 grid grid-cols-3 items-center gap-2 ${
				isLive ? "bg-muted/40 border-red-500/40" : "border-border"
			}`}
		>
			{/* Left col (spans 2): team rows */}
			<div className="col-span-2 flex flex-col gap-2 pr-2">
				{teams.map(({ team, score, side }) => {
					const isDim =
						hasScores && winner !== "tied" && winner !== side;
					const standing = standings[team.id];
					const rank = parseRank(standing?.confRank ?? null);

					return (
						<div
							key={team.id}
							className="flex items-center gap-2 min-w-0"
						>
							<Image
								src={teamLogoURL(team.id)}
								alt={team.name}
								width={32}
								height={32}
								unoptimized
								className={`shrink-0 ${isDim ? "opacity-35" : ""}`}
							/>
							<div className="flex flex-col min-w-0 leading-none">
								{/* Score (live/finished) or record + rank (upcoming) */}
								{isUpcoming ? (
									<div className="flex items-center gap-2">
										<span className="text-lg font-semibold">
											{standing?.record ?? "—"}
										</span>
										{rank && (
											<div className="flex flex-col">
												<span
													className={`text-[0.55rem] leading-tight ${rankColor(rank.num)}`}
												>
													{rank.ordinalRank}
												</span>
												<span className="text-[0.55rem] text-muted-foreground/50 leading-tight">
													{rank.conf}
												</span>
											</div>
										)}
									</div>
								) : (
									<span
										className={`text-xl font-semibold tabular-nums ${
											isDim ? "text-muted-foreground" : ""
										}`}
									>
										{score}
									</span>
								)}
								{/* Team name */}
								<span
									className={`text-[0.7rem] truncate mt-0.5 ${
										isDim
											? "text-muted-foreground/50"
											: "text-muted-foreground"
									}`}
								>
									{team.name}
								</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Right col (spans 1): game info */}
			<div className="h-full p-1 flex flex-col items-end justify-start gap-1 text-center">
				{isUpcoming && (
					<>
						<span className="text-xs font-medium text-muted-foreground leading-none">
							{game.status_text}
						</span>
						{countdown && (
							<div
								className={`flex items-center gap-1 ${countdownUrgent ? "text-red-500" : "text-muted-foreground/50"}`}
							>
								<Clock size={12} />
								<span className="text-[0.65rem] mt-0.5">
									{countdown}
								</span>
							</div>
						)}
					</>
				)}
				{isLive && (
					<>
						<span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
						<span className="text-xs font-semibold text-red-500 leading-none">
							{game.status_text}
						</span>
					</>
				)}
				{!isUpcoming && !isLive && (
					<span className="text-xs text-muted-foreground font-medium">
						{game.status_text}
					</span>
				)}
			</div>
		</div>
	);
}
