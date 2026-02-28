"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { formatSecondsToMMSS } from "@/lib/utils";
import { valueToRGB, getContrastingColor } from "@/lib/value-to-color";
import type {
	PlayerWithTeam,
	GameLogFull,
} from "@/app/(app)/player/[playerId]/page";
import type { Database } from "@/types/supabase";

const MeshGradientBg = dynamic(
	() => import("./mesh-gradient-bg").then((m) => m.MeshGradientBg),
	{ ssr: false },
);

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

	const home = played.filter((g) => g.game?.team_home_id === g.team_id);
	const away = played.filter((g) => g.game?.team_away_id === g.team_id);

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
	const [isDark, setIsDark] = useState(false);
	useEffect(() => {
		const el = document.documentElement;
		const check = () => setIsDark(el.classList.contains("dark"));
		check();
		const observer = new MutationObserver(check);
		observer.observe(el, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, []);

	const team = player.team;
	const primaryColor = team?.color_primary_hex ?? "#888888";
	const secondaryColor = team?.color_secondary_hex ?? "#555555";
	const splits = calcHomAwaySplits(gameLogs);

	const minValue =
		sa?.minutes_average != null
			? formatSecondsToMMSS(Math.round(sa.minutes_average * 60))
			: "—";

	const statGroups = [
		{ label: "PTS", value: avg(sa?.points) },
		{ label: "REB", value: avg(sa?.rebounds_total) },
		{ label: "AST", value: avg(sa?.assists) },
		{ label: "STL", value: avg(sa?.steals) },
		{ label: "BLK", value: avg(sa?.blocks) },
		{ label: "TOV", value: avg(sa?.turnovers) },
	];

	const shootingStats = [
		{ label: "FG%", value: pct(sa?.field_goals_percentage) },
		{ label: "3P%", value: pct(sa?.three_pointers_percentage) },
		{ label: "FT%", value: pct(sa?.free_throws_percentage) },
	];

	const advancedStats = [
		{
			label: "+/-",
			value:
				sa?.plus_minus != null
					? (sa.plus_minus >= 0 ? "+" : "") + avg(sa.plus_minus)
					: "—",
		},
		{ label: "GP", value: sa?.games_played?.toString() ?? "—" },
		{ label: "FP", value: avg(sa?.nba_fantasy_points) },
	];

	return (
		<div className="rounded-2xl overflow-hidden border border-border/40 relative">
			{/* Mesh gradient background */}
			<MeshGradientBg
				primaryColor={primaryColor}
				secondaryColor={secondaryColor}
			/>
			<div className="p-5 flex flex-col gap-8 relative z-10">
				{/* Header: headshot + info */}
				<div className="flex items-center gap-4">
					<div className="relative shrink-0">
						<Image
							src={playerHeadshotURL(player.id)}
							alt={`${player.first_name} ${player.last_name}`}
							width={96}
							height={72}
							className="rounded-xl object-cover"
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

						<h1 className="text-2xl md:text-3xl font-semibold leading-tight">
							{player.first_name} <span>{player.last_name}</span>
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

				{/* Counting stats */}
				<div className="flex items-center gap-4 mx-auto w-fit">
					{/* Minutes — separated visually */}
					<div className="flex flex-col items-center justify-center">
						<span className="text-lg sm:text-2xl font-semibold leading-none tabular-nums">
							{minValue}
						</span>
						<span className="text-[0.6rem]  uppercase tracking-wider text-muted-foreground font-medium">
							MIN
						</span>
					</div>

					<div className="w-px h-7 bg-muted-foreground/50 shrink-0" />

					<div className="grid grid-cols-6 gap-4 md:gap-6 items-center">
						{statGroups.map(({ label, value }) => (
							<div
								key={label}
								className="flex flex-col items-center justify-center"
							>
								<span className="text-lg sm:text-2xl font-semibold leading-none">
									{value}
								</span>
								<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
									{label}
								</span>
							</div>
						))}
					</div>
				</div>

				<div className="w-full grid grid-cols-1 items-center md:grid-cols-2 gap-4 md:gap-8">
					{/* Shooting + Advanced */}
					<div className="grid grid-cols-3 gap-2">
						{shootingStats.map(({ label, value }) => (
							<div
								key={label}
								className="flex flex-col items-center rounded-xl bg-muted/60 px-3 py-1.5"
							>
								<span className="text-sm font-semibold tabular-nums">
									{value}
								</span>
								<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
									{label}
								</span>
							</div>
						))}
						{advancedStats.map(({ label, value }) => {
							const fpBg =
								label === "FP" && sa?.nba_fantasy_points != null
									? valueToRGB({
											value: sa.nba_fantasy_points,
											min: 0,
											max: 50,
											lowColor: [197, 27, 125, 1],
											midColor: isDark
												? [220, 220, 220, 1]
												: [20, 20, 20, 1],
											highColor: [20, 184, 166, 1],
										}).replace(/[\d.]+\)$/, "1)")
									: null;

							return (
								<div
									key={label}
									className="flex flex-col items-center rounded-xl px-3 py-1.5"
									style={{
										background:
											fpBg ?? "hsl(var(--muted) / 0.6)",
										color: fpBg
											? getContrastingColor(fpBg)
											: "hsl(var(--foreground))",
									}}
								>
									<span className="text-sm font-semibold tabular-nums">
										{value}
									</span>
									<span className="text-[0.6rem] uppercase tracking-wider font-medium">
										{label}
									</span>
								</div>
							);
						})}
					</div>

					{/* Home/Away splits */}
					{(splits.home.games > 0 || splits.away.games > 0) && (
						<div className="">
							<div className="w-full grid grid-cols-2 gap-3">
								{(["home", "away"] as const).map((side) => {
									const split = splits[side];
									return (
										<div
											key={side}
											className="rounded-xl bg-muted/60 px-4 py-3 flex flex-col gap-2"
										>
											<div className="flex items-center justify-between">
												<span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													{side}
												</span>
												<span className="text-xs text-muted-foreground">
													{split.games}G
												</span>
											</div>
											<div className="flex items-center gap-4">
												<div className="flex flex-col items-center">
													<span className="text-base font-semibold tabular-nums leading-none">
														{avg(split.pts)}
													</span>
													<span className="text-[0.55rem] uppercase text-muted-foreground tracking-wider">
														pts
													</span>
												</div>
												<div className="flex flex-col items-center">
													<span className="text-base font-semibold tabular-nums leading-none">
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
		</div>
	);
}
