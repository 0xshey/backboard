"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import { formatSecondsToMMSS } from "@/lib/utils";
import { valueToRGB } from "@/lib/value-to-color";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
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
	fpRank: number | null;
}

function pct(value: number | null | undefined): string {
	if (value == null) return "—";
	return (value * 100).toFixed(1) + "%";
}

function avg(value: number | null | undefined, decimals = 1): string {
	if (value == null) return "—";
	return value.toFixed(decimals);
}

// function calcHomAwaySplits(gameLogs: GameLogFull[]) {
// 	const played = gameLogs.filter((g) => g.played === true);
// 	const home = played.filter((g) => g.game?.team_home_id === g.team_id);
// 	const away = played.filter((g) => g.game?.team_away_id === g.team_id);
// 	const mean = (games: GameLogFull[], field: keyof GameLogFull) => {
// 		const vals = games
// 			.map((g) => g[field] as number | null)
// 			.filter((v): v is number => v != null);
// 		if (!vals.length) return null;
// 		return vals.reduce((a, b) => a + b, 0) / vals.length;
// 	};
// 	return {
// 		home: { games: home.length, pts: mean(home, "points"), fp: mean(home, "fp") },
// 		away: { games: away.length, pts: mean(away, "points"), fp: mean(away, "fp") },
// 	};
// }

export function PlayerSeasonCard({
	player,
	seasonAverages: sa,
	gameLogs,
	fpRank: _fpRank,
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

	// const splits = calcHomAwaySplits(gameLogs);

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

	// const advancedStats = [
	// 	{ label: "+/-", value: sa?.plus_minus != null ? (sa.plus_minus >= 0 ? "+" : "") + avg(sa.plus_minus) : "—" },
	// 	{ label: "GP", value: sa?.games_played?.toString() ?? "—" },
	// 	{ label: "FP", value: avg(sa?.nba_fantasy_points) },
	// ];

	// FP Analytics
	const fpPerMin =
		sa?.nba_fantasy_points != null &&
		sa?.minutes_average != null &&
		sa.minutes_average > 0
			? sa.nba_fantasy_points / sa.minutes_average
			: null;

	const playedFPs = gameLogs
		.filter((g) => g.played && g.fp != null)
		.map((g) => g.fp as number);

	const { stdDev, cv } = (() => {
		if (playedFPs.length < 2) return { stdDev: null, cv: null };
		const mean = playedFPs.reduce((a, b) => a + b, 0) / playedFPs.length;
		const variance =
			playedFPs.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
			playedFPs.length;
		const s = Math.sqrt(variance);
		const c = mean > 0 ? (s / mean) * 100 : null;
		return { stdDev: s, cv: c };
	})();

	const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
	const recentLogs = gameLogs.filter(
		(g) =>
			g.played &&
			g.fp != null &&
			g.game?.datetime &&
			new Date(g.game.datetime) >= cutoff,
	);
	const recentAvg =
		recentLogs.length > 0
			? recentLogs.reduce((sum, g) => sum + (g.fp ?? 0), 0) /
				recentLogs.length
			: null;
	const trendPct =
		recentAvg != null &&
		sa?.nba_fantasy_points != null &&
		sa.nba_fantasy_points > 0
			? ((recentAvg - sa.nba_fantasy_points) / sa.nba_fantasy_points) * 100
			: null;

	return (
		<div className="rounded-2xl overflow-hidden relative shadow-md">
			{/* Mesh gradient background */}
			<MeshGradientBg
				primaryColor={primaryColor}
				secondaryColor={secondaryColor}
			/>
			<div className="p-4 flex flex-col gap-8 relative z-10">
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

					<div className="grid grid-cols-3 sm:grid-cols-6 gap-4 md:gap-6 items-center">
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

					<div className="w-px h-7 bg-muted-foreground/50 shrink-0" />

					{/* Fantasy Points — separated visually */}
					<div className="flex flex-col items-center justify-center">
						<span
							className="text-lg sm:text-2xl font-semibold leading-none tabular-nums"
							style={{
								color:
									sa?.nba_fantasy_points != null
										? valueToRGB({
												value: sa.nba_fantasy_points,
												min: 20,
												max: 50,
												lowColor: [239, 68, 68, 1],
												midColor: isDark
													? [220, 220, 220, 1]
													: [20, 20, 20, 1],
												highColor: [34, 197, 94, 1],
											})
										: undefined,
							}}
						>
							{avg(sa?.nba_fantasy_points)}
						</span>
						<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
							FP
						</span>
					</div>
				</div>

				{/* Bottom section: shooting stats + FP analytics */}
				<div className="w-full grid grid-cols-1 items-center md:grid-cols-2 gap-4 md:gap-8">
					{/* Shooting stats */}
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
					</div>

					{/* FP Analytics */}
					<TooltipProvider delayDuration={200}>
						<div className="grid grid-cols-3 gap-2">
							{/* FP/min */}
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center rounded-xl bg-muted/60 px-3 py-1.5 cursor-default">
										<span className="text-sm font-semibold tabular-nums">
											{fpPerMin != null ? fpPerMin.toFixed(2) : "—"}
										</span>
										<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
											FP/MIN
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-medium">Fantasy Points per Minute</p>
									<p className="text-muted-foreground mt-0.5">Season avg FP ÷ minutes per game. Measures scoring efficiency relative to time on court.</p>
								</TooltipContent>
							</Tooltip>

							{/* Consistency: σ + CV% */}
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center rounded-xl bg-muted/60 px-3 py-1.5 cursor-default">
										<span className="text-sm font-semibold tabular-nums">
											{stdDev != null ? stdDev.toFixed(1) : "—"}
										</span>
										<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
											σ{" "}
											{cv != null ? (
												<span
													style={{
														color: valueToRGB({
															value: cv,
															min: 15,
															max: 60,
															lowColor: [34, 197, 94, 1],
															midColor: isDark
																? [220, 220, 220, 1]
																: [20, 20, 20, 1],
															highColor: [239, 68, 68, 1],
														}),
													}}
												>
													{cv.toFixed(1)}%
												</span>
											) : null}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-medium">Consistency (σ / CV%)</p>
									<p className="text-muted-foreground mt-0.5">Standard deviation of FP across played games. CV% (coefficient of variation) shows variability relative to the average — lower is more consistent.</p>
								</TooltipContent>
							</Tooltip>

							{/* 30D Trend */}
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-col items-center rounded-xl bg-muted/60 px-3 py-1.5 cursor-default">
										<span
											className="text-sm font-semibold tabular-nums"
											style={
												trendPct != null
													? {
															color: valueToRGB({
																value: trendPct,
																min: -30,
																max: 30,
																lowColor: [239, 68, 68, 1],
																midColor: isDark
																	? [220, 220, 220, 1]
																	: [20, 20, 20, 1],
																highColor: [34, 197, 94, 1],
															}),
														}
													: undefined
											}
										>
											{trendPct != null
												? (trendPct >= 0 ? "+" : "") +
													trendPct.toFixed(1) +
													"%"
												: "—"}
										</span>
										<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
											30D{" "}
											{recentLogs.length > 0 && (
												<span>L{recentLogs.length}G</span>
											)}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-medium">30-Day FP Trend</p>
									<p className="text-muted-foreground mt-0.5">Average FP over the last 30 days vs. the full season average. Green means running hot, red means running cold.</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</TooltipProvider>

					{/* Home/Away splits — commented out */}
					{/* {(splits.home.games > 0 || splits.away.games > 0) && (
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
					)} */}
				</div>
			</div>
		</div>
	);
}
