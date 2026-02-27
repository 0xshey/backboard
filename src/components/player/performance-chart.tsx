"use client";

import { useState, useMemo } from "react";
import {
	ComposedChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts";
import { DateTime } from "luxon";
import { formatSecondsToMMSS } from "@/lib/utils";
import type { GameLogFull } from "@/app/(app)/player/[playerId]/page";

type StatKey =
	| "points"
	| "rebounds_total"
	| "assists"
	| "fp"
	| "plus_minus"
	| "seconds";

const STAT_OPTIONS: { key: StatKey; label: string; shortLabel: string }[] = [
	{ key: "points", label: "Points", shortLabel: "PTS" },
	{ key: "rebounds_total", label: "Rebounds", shortLabel: "REB" },
	{ key: "assists", label: "Assists", shortLabel: "AST" },
	{ key: "fp", label: "Fantasy Pts", shortLabel: "FP" },
	{ key: "plus_minus", label: "Plus/Minus", shortLabel: "+/-" },
	{ key: "seconds", label: "Minutes", shortLabel: "MIN" },
];

function formatStatValue(key: StatKey, value: number | null): string {
	if (value == null) return "—";
	if (key === "seconds") return formatSecondsToMMSS(value);
	if (key === "plus_minus") return (value >= 0 ? "+" : "") + value.toFixed(1);
	if (key === "fp") return value.toFixed(1);
	return value.toString();
}

function rollingAverage(data: number[], window: number): (number | null)[] {
	return data.map((_, i) => {
		if (i < window - 1) return null;
		const slice = data.slice(i - window + 1, i + 1);
		const valid = slice.filter((v) => v != null) as number[];
		if (!valid.length) return null;
		return valid.reduce((a, b) => a + b, 0) / valid.length;
	});
}

interface ChartPoint {
	gameIndex: number;
	dateLabel: string;
	oppTricode: string;
	isHome: boolean;
	value: number | null;
	rollingAvg: number | null;
	starter: boolean | null;
	played: boolean;
	seconds: number | null;
	notPlayingReason: string | null;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ name: string; value: number | null; payload: ChartPoint }>;
	selectedStat: StatKey;
	teamColor: string | null;
}

function CustomTooltip({
	active,
	payload,
	selectedStat,
	teamColor,
}: CustomTooltipProps) {
	if (!active || !payload?.length) return null;
	const point: ChartPoint = payload[0].payload;

	return (
		<div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg text-sm min-w-40">
			<div className="flex items-center justify-between gap-3 mb-2">
				<span className="font-semibold text-foreground">{point.oppTricode}</span>
				<span className="text-xs text-muted-foreground">{point.dateLabel}</span>
			</div>

			{point.played ? (
				<>
					<div className="flex items-center justify-between gap-4">
						<span className="text-muted-foreground uppercase text-xs tracking-wide">
							{STAT_OPTIONS.find((s) => s.key === selectedStat)?.shortLabel}
						</span>
						<span className="font-bold text-base tabular-nums">
							{formatStatValue(selectedStat, point.value)}
						</span>
					</div>
					{selectedStat !== "seconds" && point.seconds != null && (
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground uppercase text-xs tracking-wide">MIN</span>
							<span className="text-xs tabular-nums text-muted-foreground">
								{formatSecondsToMMSS(point.seconds)}
							</span>
						</div>
					)}
					<div className="flex items-center justify-between mt-1 pt-1 border-t border-border/40">
						<span className="text-muted-foreground text-xs">
							{point.isHome ? "Home" : "Away"}
						</span>
						{point.starter != null && (
							<span
								className="text-xs px-1.5 py-0.5 rounded font-medium"
								style={{
									backgroundColor: point.starter
										? `${teamColor ?? "#888"}30`
										: "transparent",
									color: point.starter
										? (teamColor ?? "inherit")
										: "hsl(var(--muted-foreground))",
								}}
							>
								{point.starter ? "Starter" : "Bench"}
							</span>
						)}
					</div>
				</>
			) : (
				<div className="text-muted-foreground text-xs">
					DNP{point.notPlayingReason ? ` — ${point.notPlayingReason}` : ""}
				</div>
			)}
		</div>
	);
}

interface PerformanceChartProps {
	gameLogs: GameLogFull[];
	teamColor: string | null;
}

export function PerformanceChart({ gameLogs, teamColor }: PerformanceChartProps) {
	const [selectedStat, setSelectedStat] = useState<StatKey>("points");
	const [showRolling, setShowRolling] = useState(true);
	const [rollingWindow, setRollingWindow] = useState(5);

	const accent = teamColor ?? "#6366f1";

	const chartData = useMemo<ChartPoint[]>(() => {
		const playedLogs = gameLogs.filter((g) => g.played === true);

		const rawValues = playedLogs.map((g) => g[selectedStat] as number | null);
		const rolling = rollingAverage(
			rawValues.map((v) => v ?? 0),
			rollingWindow
		);

		// Build a unified list: played games + DNP annotations
		// Index played games first to get rolling avgs, then merge with DNPs
		const allGames = gameLogs.map((g, allIdx) => {
			const playedIdx = playedLogs.indexOf(g);
			const rollingVal =
				g.played && playedIdx >= 0 ? rolling[playedIdx] : null;

			const opp = g.opp_team;
			const isHome = g.game?.team_home_id === g.team_id;

			return {
				gameIndex: allIdx,
				dateLabel: g.game?.datetime
					? DateTime.fromISO(g.game.datetime)
							.setZone("America/New_York")
							.toFormat("LLL d")
					: "",
				oppTricode: opp?.tricode ?? "???",
				isHome,
				value: g.played ? (g[selectedStat] as number | null) : null,
				rollingAvg: rollingVal,
				starter: g.starter ?? null,
				played: g.played ?? false,
				seconds: g.seconds ?? null,
				notPlayingReason: g.not_playing_reason ?? null,
			} satisfies ChartPoint;
		});

		return allGames;
	}, [gameLogs, selectedStat, rollingWindow]);

	const dnpIndices = chartData
		.filter((d) => !d.played)
		.map((d) => d.gameIndex);

	// Y-axis domain with padding
	const playedValues = chartData
		.filter((d) => d.played && d.value != null)
		.map((d) => d.value as number);
	const yMin = playedValues.length ? Math.min(...playedValues) : 0;
	const yMax = playedValues.length ? Math.max(...playedValues) : 10;
	const yPad = Math.max((yMax - yMin) * 0.15, 2);

	return (
		<div className="rounded-2xl border border-border/40 overflow-hidden">
			<div className="p-5 flex flex-col gap-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<h2 className="text-base font-semibold">Game-by-Game Performance</h2>

					{/* Stat selector */}
					<div className="flex flex-wrap gap-1">
						{STAT_OPTIONS.map((opt) => (
							<button
								key={opt.key}
								onClick={() => setSelectedStat(opt.key)}
								className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
								style={
									selectedStat === opt.key
										? {
												backgroundColor: accent,
												color: "#fff",
											}
										: {
												backgroundColor: "hsl(var(--muted))",
												color: "hsl(var(--muted-foreground))",
											}
								}
							>
								{opt.shortLabel}
							</button>
						))}
					</div>
				</div>

				{/* Rolling average controls */}
				<div className="flex items-center gap-3 text-sm">
					<button
						onClick={() => setShowRolling((v) => !v)}
						className="flex items-center gap-2 text-xs font-medium transition-opacity"
					>
						<span
							className="inline-flex w-4 h-4 rounded items-center justify-center border-2 transition-colors"
							style={{
								borderColor: accent,
								backgroundColor: showRolling ? accent : "transparent",
							}}
						/>
						<span className="text-muted-foreground">
							Rolling avg
						</span>
					</button>

					{showRolling && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<button
								onClick={() =>
									setRollingWindow((w) => Math.max(3, w - 1))
								}
								className="w-5 h-5 rounded bg-muted hover:bg-muted/70 font-bold leading-none flex items-center justify-center"
							>
								−
							</button>
							<span className="tabular-nums min-w-8 text-center font-medium text-foreground">
								{rollingWindow}G
							</span>
							<button
								onClick={() =>
									setRollingWindow((w) => Math.min(10, w + 1))
								}
								className="w-5 h-5 rounded bg-muted hover:bg-muted/70 font-bold leading-none flex items-center justify-center"
							>
								+
							</button>
						</div>
					)}
				</div>

				{/* Chart */}
				<div className="h-64 sm:h-80 -mx-2">
					<ResponsiveContainer width="100%" height="100%">
						<ComposedChart
							data={chartData}
							margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
						>
							<CartesianGrid
								strokeDasharray="3 3"
								strokeOpacity={0.15}
								vertical={false}
							/>

							<XAxis
								dataKey="gameIndex"
								tickLine={false}
								axisLine={false}
								tick={false}
								height={8}
							/>

							<YAxis
								domain={[
									Math.floor(yMin - yPad),
									Math.ceil(yMax + yPad),
								]}
								tickLine={false}
								axisLine={false}
								tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
								width={32}
							/>

							<Tooltip
								content={
									<CustomTooltip
										selectedStat={selectedStat}
										teamColor={teamColor}
									/>
								}
								cursor={{
									stroke: "hsl(var(--border))",
									strokeWidth: 1,
									strokeDasharray: "4 2",
								}}
							/>

							{/* DNP markers as reference lines */}
							{dnpIndices.map((idx) => (
								<ReferenceLine
									key={idx}
									x={idx}
									stroke="hsl(var(--muted-foreground))"
									strokeOpacity={0.3}
									strokeDasharray="2 4"
									strokeWidth={1}
									label={undefined}
								/>
							))}

							{/* Line connecting played games */}
							<Line
								dataKey="value"
								dot={{
									r: 3.5,
									fill: "hsl(var(--background))",
									stroke: "hsl(var(--muted-foreground))",
									strokeWidth: 1.5,
								}}
								activeDot={{
									r: 5,
									fill: accent,
									stroke: "hsl(var(--background))",
									strokeWidth: 2,
								}}
								stroke="hsl(var(--muted-foreground))"
								strokeWidth={1.5}
								strokeOpacity={0.6}
								connectNulls={false}
								type="monotone"
								isAnimationActive={false}
							/>

							{/* Rolling average line */}
							{showRolling && (
								<Line
									dataKey="rollingAvg"
									stroke={accent}
									strokeWidth={2.5}
									dot={false}
									activeDot={false}
									connectNulls={true}
									type="monotone"
									isAnimationActive={false}
									strokeLinejoin="round"
									strokeLinecap="round"
								/>
							)}
						</ComposedChart>
					</ResponsiveContainer>
				</div>

				{/* X-axis date labels (sampled) */}
				<div className="flex justify-between text-[0.6rem] text-muted-foreground px-8 -mt-2">
					{chartData.length > 0 && (
						<>
							<span>{chartData[0].dateLabel}</span>
							{chartData.length > 2 && (
								<span>
									{
										chartData[Math.floor(chartData.length / 2)]
											.dateLabel
									}
								</span>
							)}
							<span>{chartData[chartData.length - 1].dateLabel}</span>
						</>
					)}
				</div>

				{/* Legend hint for DNPs */}
				{dnpIndices.length > 0 && (
					<p className="text-[0.65rem] text-muted-foreground/60 text-right">
						Dashed lines mark DNP games ({dnpIndices.length})
					</p>
				)}
			</div>
		</div>
	);
}
