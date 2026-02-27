import Image from "next/image";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { formatSecondsToMMSS } from "@/lib/utils";
import type { PlayerWithTeam, GameLogFull } from "@/app/(app)/player/[playerId]/page";
import type { Database } from "@/types/supabase";

type SeasonAveragesRow =
	Database["public"]["Tables"]["player_season_averages"]["Row"];

interface PlayerSeasonCardProps {
	player: PlayerWithTeam;
	seasonAverages: SeasonAveragesRow | null;
	gameLogs: GameLogFull[];
}

function pct(value: number | null | undefined): string {
	if (value == null) return "—";
	return (value * 100).toFixed(1) + "%";
}

function avg(value: number | null | undefined, decimals = 1): string {
	if (value == null) return "—";
	return value.toFixed(decimals);
}

function calcHomAwaySplits(gameLogs: GameLogFull[]) {
	const played = gameLogs.filter((g) => g.played === true);

	const home = played.filter(
		(g) => g.game?.team_home_id === g.team_id
	);
	const away = played.filter(
		(g) => g.game?.team_away_id === g.team_id
	);

	const mean = (games: GameLogFull[], field: keyof GameLogFull) => {
		const vals = games
			.map((g) => g[field] as number | null)
			.filter((v): v is number => v != null);
		if (!vals.length) return null;
		return vals.reduce((a, b) => a + b, 0) / vals.length;
	};

	return {
		home: {
			games: home.length,
			pts: mean(home, "points"),
			fp: mean(home, "fp"),
		},
		away: {
			games: away.length,
			pts: mean(away, "points"),
			fp: mean(away, "fp"),
		},
	};
}

export function PlayerSeasonCard({
	player,
	seasonAverages: sa,
	gameLogs,
}: PlayerSeasonCardProps) {
	const team = player.team;
	const accentColor = team?.color_primary_hex ?? "#888888";
	const splits = calcHomAwaySplits(gameLogs);

	const statGroups = [
		{
			label: "PPG",
			value: avg(sa?.points),
		},
		{
			label: "RPG",
			value: avg(sa?.rebounds_total),
		},
		{
			label: "APG",
			value: avg(sa?.assists),
		},
		{
			label: "SPG",
			value: avg(sa?.steals),
		},
		{
			label: "BPG",
			value: avg(sa?.blocks),
		},
		{
			label: "MPG",
			// minutes_average is already in decimal minutes
			value: avg(sa?.minutes_average, 1),
		},
	];

	const shootingStats = [
		{ label: "FG%", value: pct(sa?.field_goals_percentage) },
		{ label: "3P%", value: pct(sa?.three_pointers_percentage) },
		{ label: "FT%", value: pct(sa?.free_throws_percentage) },
	];

	const advancedStats = [
		{
			label: "+/-",
			value: sa?.plus_minus != null
				? (sa.plus_minus >= 0 ? "+" : "") + avg(sa.plus_minus)
				: "—",
		},
		{ label: "FP", value: avg(sa?.nba_fantasy_points) },
		{ label: "GP", value: sa?.games_played?.toString() ?? "—" },
	];

	return (
		<div
			className="rounded-2xl overflow-hidden border border-border/40 relative"
			style={{ background: `linear-gradient(135deg, ${accentColor}18 0%, transparent 60%)` }}
		>
			{/* Accent top bar */}
			<div
				className="h-1 w-full"
				style={{ backgroundColor: accentColor }}
			/>

			<div className="p-5 flex flex-col gap-5">
				{/* Header: headshot + info */}
				<div className="flex items-center gap-4">
					<div className="relative shrink-0">
						<Image
							src={playerHeadshotURL(player.id)}
							alt={`${player.first_name} ${player.last_name}`}
							width={96}
							height={72}
							className="rounded-xl object-cover bg-muted"
							unoptimized
						/>
					</div>

					<div className="flex flex-col gap-1 min-w-0">
						<div className="flex items-center gap-2">
							{team && (
								<Image
									src={teamLogoURL(team.id)}
									alt={team.name ?? ""}
									width={28}
									height={28}
									unoptimized
								/>
							)}
							<span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
								{team?.city} {team?.name}
								{player.jersey_number != null &&
									` · #${player.jersey_number}`}
							</span>
						</div>

						<h1 className="text-2xl md:text-3xl font-bold leading-tight">
							{player.first_name}{" "}
							<span style={{ color: accentColor }}>
								{player.last_name}
							</span>
						</h1>

						{sa && (
							<div className="flex items-center gap-3 text-xs text-muted-foreground">
								<span>2025–26 Season</span>
								<span>·</span>
								<span>
									{sa.wins ?? 0}–{sa.losses ?? 0}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Counting stats grid */}
				<div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
					{statGroups.map(({ label, value }) => (
						<div
							key={label}
							className="flex flex-col items-center justify-center rounded-xl bg-muted/40 py-2.5 px-2 gap-0.5"
						>
							<span className="text-lg md:text-xl font-bold tabular-nums leading-none">
								{value}
							</span>
							<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
								{label}
							</span>
						</div>
					))}
				</div>

				{/* Shooting + Advanced */}
				<div className="flex flex-wrap gap-2">
					{shootingStats.map(({ label, value }) => (
						<div
							key={label}
							className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5"
						>
							<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
								{label}
							</span>
							<span className="text-sm font-semibold tabular-nums">
								{value}
							</span>
						</div>
					))}
					<div className="w-px bg-border/40 mx-1" />
					{advancedStats.map(({ label, value }) => (
						<div
							key={label}
							className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
							style={{
								background: label === "FP"
									? `${accentColor}20`
									: "hsl(var(--muted) / 0.3)",
							}}
						>
							<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
								{label}
							</span>
							<span
								className="text-sm font-semibold tabular-nums"
								style={label === "FP" ? { color: accentColor } : {}}
							>
								{value}
							</span>
						</div>
					))}
				</div>

				{/* Home/Away splits */}
				{(splits.home.games > 0 || splits.away.games > 0) && (
					<div className="border-t border-border/30 pt-4">
						<p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
							Home / Away Splits
						</p>
						<div className="grid grid-cols-2 gap-3">
							{(["home", "away"] as const).map((side) => {
								const split = splits[side];
								return (
									<div
										key={side}
										className="rounded-xl bg-muted/30 px-4 py-3 flex flex-col gap-1"
									>
										<div className="flex items-center justify-between">
											<span
												className="text-xs font-semibold uppercase tracking-wider"
												style={
													side === "home"
														? { color: accentColor }
														: {}
												}
											>
												{side}
											</span>
											<span className="text-xs text-muted-foreground">
												{split.games}G
											</span>
										</div>
										<div className="flex items-center gap-4">
											<div className="flex flex-col items-center">
												<span className="text-base font-bold tabular-nums leading-none">
													{avg(split.pts)}
												</span>
												<span className="text-[0.55rem] uppercase text-muted-foreground tracking-wider">
													pts
												</span>
											</div>
											<div className="flex flex-col items-center">
												<span className="text-base font-bold tabular-nums leading-none">
													{avg(split.fp)}
												</span>
												<span className="text-[0.55rem] uppercase text-muted-foreground tracking-wider">
													fp
												</span>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
