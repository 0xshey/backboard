"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { valueToRGB, getContrastingColor } from "@/lib/value-to-color";
import { teamLogoURL } from "@/lib/image-urls";
import { cn } from "@/lib/utils";
import type { GameSection } from "@/app/(app)/demo/projected-fp/projected-fp-content";
import type { ProjectionResult } from "@/lib/projected-fp";

interface Props {
	gameSections: GameSection[];
	hasCompletedGames: boolean;
	mae: number | null;
	completedCount: number;
}

export function ProjectedFPTable({
	gameSections,
	hasCompletedGames,
	mae,
	completedCount,
}: Props) {
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const toggle = (id: string) =>
		setExpandedId((prev) => (prev === id ? null : id));

	return (
		<div className="flex flex-col gap-8">
			{/* Accuracy summary — only if completed games with projections */}
			{mae !== null && completedCount > 0 && (
				<div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex flex-col gap-1">
					<p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
						Formula Accuracy
					</p>
					<div className="flex items-baseline gap-3">
						<span className="text-2xl font-semibold tabular-nums">
							±{mae.toFixed(1)}
						</span>
						<span className="text-sm text-muted-foreground">
							mean absolute error across {completedCount} players
						</span>
					</div>
				</div>
			)}

			{/* nba_api upgrade note */}
			<div className="rounded-xl border border-border/50 bg-muted/20 px-5 py-4 flex flex-col gap-2">
				<p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
					Formula Upgrade Path (via nba_api)
				</p>
				<ul className="text-xs text-muted-foreground space-y-1">
					<li>
						<span className="text-foreground font-medium">Pace</span>{" "}
						— Replace the points-for proxy with actual possessions per 48 min
						(LeagueDashTeamStats)
					</li>
					<li>
						<span className="text-foreground font-medium">
							Position defense
						</span>{" "}
						— OPP_DEF per position (G/F/C) instead of aggregate
						(LeagueDashPtDefend)
					</li>
					<li>
						<span className="text-foreground font-medium">Usage rate</span>{" "}
						— Adjust base when teammates are out (LeagueDashPlayerStats)
					</li>
					<li>
						<span className="text-foreground font-medium">Injury reports</span>{" "}
						— Highest-leverage signal; currently blind to lineup changes
					</li>
				</ul>
			</div>

			{/* Game sections */}
			{gameSections.map(({ game, projections, standings }) => {
				const homeTeam = (game as any).home_team;
				const awayTeam = (game as any).away_team;
				const statusCode = (game as any).status_code;
				const homeScore = (game as any).team_home_score;
				const awayScore = (game as any).team_away_score;
				const statusText = (game as any).status_text ?? "";
				const isLive = statusCode === 2;
				const isDone = statusCode === 3;
				const homeStanding = homeTeam ? standings[homeTeam.id] : null;
				const awayStanding = awayTeam ? standings[awayTeam.id] : null;

				return (
					<div
						key={game.id}
						className="flex flex-col gap-3"
					>
						{/* Game header */}
						<div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
							<div className="flex items-center gap-3">
								{awayTeam && (
									<div className="flex items-center gap-2">
										<Image
											src={teamLogoURL(awayTeam.id)}
											alt={awayTeam.name}
											width={28}
											height={28}
											quality={100}
										/>
										<div className="flex flex-col">
											<span className="text-sm font-semibold leading-none">
												{awayTeam.tricode ?? awayTeam.name}
											</span>
											{awayStanding && (
												<span className="text-xs text-muted-foreground">
													{awayStanding.record}
												</span>
											)}
										</div>
									</div>
								)}
								<span className="text-muted-foreground text-sm font-medium px-1">
									@
								</span>
								{homeTeam && (
									<div className="flex items-center gap-2">
										<Image
											src={teamLogoURL(homeTeam.id)}
											alt={homeTeam.name}
											width={28}
											height={28}
											quality={100}
										/>
										<div className="flex flex-col">
											<span className="text-sm font-semibold leading-none">
												{homeTeam.tricode ?? homeTeam.name}
											</span>
											{homeStanding && (
												<span className="text-xs text-muted-foreground">
													{homeStanding.record}
												</span>
											)}
										</div>
									</div>
								)}
							</div>

							<div className="flex items-center gap-2 text-sm">
								{isLive && (
									<div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
								)}
								{(isLive || isDone) && homeScore != null && awayScore != null ? (
									<span className="font-semibold tabular-nums">
										{awayScore} – {homeScore}
									</span>
								) : null}
								<span
									className={cn(
										"text-xs text-muted-foreground",
										isLive && "text-red-500 font-medium",
									)}
								>
									{statusText}
								</span>
							</div>
						</div>

						{/* Table */}
						<div className="overflow-x-auto rounded-xl border border-border">
							<table className="w-full text-sm border-collapse">
								<thead>
									<tr className="border-b border-border bg-muted/30">
										<th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider min-w-40">
											Player
										</th>
										<th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
											AVG
										</th>
										<th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
											PROJ
										</th>
										<th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
											Δ
										</th>
										<th className="text-center px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
											Conf
										</th>
										{hasCompletedGames && (
											<>
												<th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
													Actual
												</th>
												<th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
													Err
												</th>
											</>
										)}
										<th className="w-8" />
									</tr>
								</thead>
								<tbody>
									{projections.map((proj) => (
										<PlayerRows
											key={proj.playerId}
											proj={proj}
											hasCompletedGames={hasCompletedGames}
											isExpanded={expandedId === proj.playerId}
											onToggle={() => toggle(proj.playerId)}
											colCount={hasCompletedGames ? 8 : 6}
										/>
									))}
								</tbody>
							</table>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function PlayerRows({
	proj,
	hasCompletedGames,
	isExpanded,
	onToggle,
	colCount,
}: {
	proj: ProjectionResult;
	hasCompletedGames: boolean;
	isExpanded: boolean;
	onToggle: () => void;
	colCount: number;
}) {
	const delta = proj.projectedFP - proj.seasonAvgFP;
	const projBg = valueToRGB({ value: proj.projectedFP, schema: "fantasyPoints" });
	const projColor = getContrastingColor(projBg);
	const deltaColor = valueToRGB({
		value: delta,
		min: -20,
		max: 20,
		midColor: [160, 160, 160, 1],
	});

	return (
		<>
			<tr
				className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
				onClick={onToggle}
			>
				{/* Player */}
				<td className="px-3 py-2">
					<div className="flex items-center gap-2">
						<Image
							src={teamLogoURL(proj.teamId)}
							alt=""
							width={18}
							height={18}
							quality={100}
							className="opacity-60 shrink-0"
						/>
						<Link
							href={`/player/${proj.playerId}`}
							className="hover:opacity-70 transition-opacity"
							onClick={(e) => e.stopPropagation()}
						>
							<span className="text-muted-foreground text-xs">
								{proj.firstName}{" "}
							</span>
							<span className="font-medium">{proj.lastName}</span>
						</Link>
					</div>
				</td>

				{/* Season AVG */}
				<td className="px-3 py-2 text-right">
					<span className="tabular-nums text-muted-foreground">
						{proj.seasonAvgFP.toFixed(1)}
					</span>
				</td>

				{/* PROJ FP */}
				<td className="px-2 py-1.5 text-right">
					<div
						className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-14"
						style={{ backgroundColor: projBg, color: projColor }}
					>
						<span className="font-semibold tabular-nums">
							{proj.projectedFP.toFixed(1)}
						</span>
					</div>
				</td>

				{/* Delta */}
				<td className="px-3 py-2 text-right">
					<span
						className="font-medium tabular-nums text-xs"
						style={{ color: deltaColor }}
					>
						{delta >= 0 ? "+" : ""}
						{delta.toFixed(1)}
					</span>
				</td>

				{/* Confidence */}
				<td className="px-3 py-2 text-center">
					<ConfidenceBadge label={proj.confidenceLabel} />
				</td>

				{/* Actual + Error (completed games only) */}
				{hasCompletedGames && (
					<>
						<td className="px-2 py-1.5 text-right">
							{proj.actualFP != null ? (
								<div
									className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-14"
									style={{
										backgroundColor: valueToRGB({
											value: proj.actualFP,
											schema: "fantasyPoints",
										}),
										color: getContrastingColor(
											valueToRGB({
												value: proj.actualFP,
												schema: "fantasyPoints",
											}),
										),
									}}
								>
									<span className="font-semibold tabular-nums">
										{proj.actualFP.toFixed(1)}
									</span>
								</div>
							) : (
								<span className="text-muted-foreground text-xs">—</span>
							)}
						</td>
						<td className="px-3 py-2 text-right">
							{proj.error != null ? (
								<span
									className="font-medium tabular-nums text-xs"
									style={{
										color: valueToRGB({
											value: -Math.abs(proj.error),
											min: -25,
											max: 0,
											lowColor: [192, 11, 35, 1],
											midColor: [160, 160, 160, 1],
											highColor: [43, 168, 74, 1],
										}),
									}}
								>
									{proj.error >= 0 ? "+" : ""}
									{proj.error.toFixed(1)}
								</span>
							) : (
								<span className="text-muted-foreground text-xs">—</span>
							)}
						</td>
					</>
				)}

				{/* Expand toggle */}
				<td className="px-2 py-2 text-center">
					{isExpanded ? (
						<ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
					) : (
						<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
					)}
				</td>
			</tr>

			{/* Breakdown row */}
			{isExpanded && (
				<tr className="border-b border-border/50 bg-muted/10">
					<td
						colSpan={colCount}
						className="px-4 py-4"
					>
						<FormulaBreakdown proj={proj} />
					</td>
				</tr>
			)}
		</>
	);
}

function ConfidenceBadge({ label }: { label: "Low" | "Medium" | "High" }) {
	return (
		<span
			className={cn(
				"inline-block text-xs font-medium px-2 py-0.5 rounded-full",
				label === "High" &&
					"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
				label === "Medium" &&
					"bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
				label === "Low" && "bg-red-500/15 text-red-600 dark:text-red-400",
			)}
		>
			{label}
		</span>
	);
}

function FormulaBreakdown({ proj }: { proj: ProjectionResult }) {
	const c = proj.components;

	// Build the base breakdown string
	const baseWeightDesc =
		c.avgL10 != null && c.avgL5 != null
			? `0.35 × ${c.avgSeason.toFixed(1)} + 0.40 × ${c.avgL10.toFixed(1)} + 0.25 × ${c.avgL5.toFixed(1)}`
			: c.avgL10 != null
				? `0.45 × ${c.avgSeason.toFixed(1)} + 0.55 × ${c.avgL10.toFixed(1)}`
				: `${c.avgSeason.toFixed(1)} (season avg only)`;

	const oppLabel =
		c.oppDefFactor > 1.05
			? "soft defense — allows more FP than average"
			: c.oppDefFactor < 0.95
				? "stout defense — allows fewer FP than average"
				: "average defense";

	const haLabel =
		c.homeAwaySource === "historical"
			? `${c.isHome ? "home" : "away"} (${c.isHome ? c.homeGamesCount : c.awayGamesCount} games, historical)`
			: `${c.isHome ? "home" : "away"} (static league avg)`;

	const paceLabel =
		c.oppQualityFactor > 1.02
			? "fast-paced opponent"
			: c.oppQualityFactor < 0.98
				? "slow-paced opponent"
				: "average pace opponent";

	const rows = [
		{
			label: "BASE",
			formula: baseWeightDesc,
			value: c.baseAvg.toFixed(1),
			note: c.avgL5 != null
				? `L5: ${c.l5GamesCount} games`
				: "L5 insufficient (<3 games)",
		},
		{
			label: "OPP DEF",
			formula: `${c.oppDefFactor.toFixed(3)}×`,
			value: null,
			note: oppLabel,
		},
		{
			label: "HOME/AWAY",
			formula: `${c.homeAwayFactor.toFixed(3)}×`,
			value: null,
			note: haLabel,
		},
		{
			label: "PACE",
			formula: `${c.oppQualityFactor.toFixed(3)}×`,
			value: null,
			note: paceLabel,
		},
	];

	return (
		<div className="flex flex-col gap-3">
			<div className="grid grid-cols-1 gap-1.5">
				{rows.map((row) => (
					<div
						key={row.label}
						className="flex items-start gap-3 text-xs"
					>
						<span className="font-mono text-muted-foreground/60 w-20 shrink-0 pt-px">
							{row.label}
						</span>
						<span className="font-mono font-medium text-foreground">
							{row.formula}
						</span>
						{row.value && (
							<span className="text-muted-foreground">= {row.value}</span>
						)}
						<span className="text-muted-foreground/60 ml-1">
							{row.note}
						</span>
					</div>
				))}
			</div>

			<div className="border-t border-border/50 pt-3 flex items-center gap-2 text-xs font-mono">
				<span className="text-muted-foreground">
					{c.baseAvg.toFixed(1)} × {c.oppDefFactor.toFixed(3)} ×{" "}
					{c.homeAwayFactor.toFixed(3)} × {c.oppQualityFactor.toFixed(3)}
				</span>
				<span className="text-muted-foreground">=</span>
				<span
					className="font-bold text-sm px-2 py-0.5 rounded"
					style={{
						backgroundColor: valueToRGB({
							value: proj.projectedFP,
							schema: "fantasyPoints",
						}),
						color: getContrastingColor(
							valueToRGB({
								value: proj.projectedFP,
								schema: "fantasyPoints",
							}),
						),
					}}
				>
					{proj.projectedFP.toFixed(1)}
				</span>
			</div>
		</div>
	);
}
