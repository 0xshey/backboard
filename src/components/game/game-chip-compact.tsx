import Image from "next/image";
import { teamLogoURL } from "@/lib/image-urls";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamStanding } from "@/app/(app)/rankings/functions";

interface GameChipCompactProps {
	game?: any;
	loading?: boolean;
	standings?: Record<string, TeamStanding>;
}

export function GameChipCompact({
	game,
	loading,
	standings = {},
}: GameChipCompactProps) {
	if (loading) {
		return <Skeleton className="shrink-0 w-28 h-12 rounded-xl" />;
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

	const awayTeam = game.away_team;
	const homeTeam = game.home_team;
	const awayStanding = standings[awayTeam?.id];
	const homeStanding = standings[homeTeam?.id];

	const awayDim = hasScores && winner !== "tied" && winner !== "away";
	const homeDim = hasScores && winner !== "tied" && winner !== "home";

	const borderClass = isLive
		? "border-red-500/40 bg-muted/40"
		: isUpcoming
			? "border-border bg-muted/60"
			: "border-muted-foreground/40 bg-muted/60";

	return (
		<div
			className={`shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl border ${borderClass}`}
		>
			{/* scores / records row */}
			<div className="flex items-center gap-1.5">
				{awayTeam && (
					<Image
						src={teamLogoURL(awayTeam.id)}
						alt={awayTeam.name}
						width={20}
						height={20}
						unoptimized
						className="shrink-0"
					/>
				)}
				<span
					className={`text-xs tabular-nums font-medium ${isUpcoming ? "font-stretch-75% text-muted-foreground" : awayDim ? "text-muted-foreground/50" : ""}`}
				>
					{isUpcoming
						? (awayStanding?.record ?? "—")
						: game.team_away_score}
				</span>
				<span className="text-muted-foreground text-xs">
					{isUpcoming ? "•" : "-"}
				</span>
				<span
					className={`text-xs tabular-nums font-medium ${isUpcoming ? "font-stretch-75% text-muted-foreground" : homeDim ? "text-muted-foreground/50" : ""}`}
				>
					{isUpcoming
						? (homeStanding?.record ?? "—")
						: game.team_home_score}
				</span>
				{homeTeam && (
					<Image
						src={teamLogoURL(homeTeam.id)}
						alt={homeTeam.name}
						width={20}
						height={20}
						unoptimized
						className="shrink-0"
					/>
				)}
			</div>
			{/* status label */}
			<div className="flex items-center gap-1.5">
				{isLive && (
					<span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
				)}
				<span className="text-[0.6rem] text-muted-foreground leading-none">
					{game.status_text}
				</span>
			</div>
		</div>
	);
}
