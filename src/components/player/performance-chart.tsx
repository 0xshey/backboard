"use client";

import { useState, useMemo, useCallback } from "react";
import {
	ComposedChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
	Customized,
} from "recharts";
import { DateTime } from "luxon";
import { formatSecondsToMMSS } from "@/lib/utils";
import { valueToRGB } from "@/lib/value-to-color";
import type { GameLogFull } from "@/app/(app)/player/[playerId]/page";

type StatKey = "fp" | "plus_minus" | "seconds";

const STAT_OPTIONS: { key: StatKey; label: string; shortLabel: string }[] = [
	{ key: "fp", label: "Fantasy Pts", shortLabel: "FP" },
	{ key: "plus_minus", label: "Plus/Minus", shortLabel: "+/-" },
	{ key: "seconds", label: "Minutes", shortLabel: "MIN" },
];

// ─── Gradient Config ─────────────────────────────────────────────────────────
// All tweakable values for the rolling-average line gradient live here.
// Change colors or thresholds without touching any rendering logic below.

const GRADIENT_CONFIG = {
	fp: {
		mean: 30, // center of the gradient (NBA avg FP)
		stdDev: 8, // one standard deviation — thresholds are mean ± 1σ and mean ± 2σ

		// Colors — same scheme as plus/minus
		brightGreen: "rgb(34, 197, 94)", // rolling avg ≥ mean + 2σ
		dimGreen: "rgb(134, 239, 172)", // rolling avg ≈ mean + 1σ
		neutral: "rgb(200, 200, 200)", // rolling avg at mean
		dimRed: "rgb(252, 165, 165)", // rolling avg ≈ mean - 1σ
		brightRed: "rgb(239, 68, 68)", // rolling avg ≤ mean - 2σ
	},
	plusMinus: {
		// Stat value thresholds where the gradient transitions between dim and bright.
		dimThreshold: 8, // ± value at which dim color starts
		brightThreshold: 16, // ± value at which color reaches full brightness

		// Colors — from most positive to most negative
		brightGreen: "rgb(34, 197, 94)", // rolling avg ≥ +brightThreshold
		dimGreen: "rgb(134, 239, 172)", // rolling avg ≈ +dimThreshold
		neutral: "rgb(200, 200, 200)", // rolling avg at 0
		dimRed: "rgb(252, 165, 165)", // rolling avg ≈ -dimThreshold
		brightRed: "rgb(239, 68, 68)", // rolling avg ≤ -brightThreshold
	},
} as const;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders SVG <defs> with a vertical linearGradient for the rolling avg line.
 * Injected via Recharts' <Customized> so we can access the y-axis scale
 * and use gradientUnits="userSpaceOnUse" for value-accurate positioning.
 */
function RollingGradientDef({
	yAxisMap,
	selectedStat,
	domainMin,
	domainMax,
}: {
	yAxisMap?: Record<string, unknown>;
	selectedStat: StatKey;
	domainMin: number;
	domainMax: number;
}) {
	if (selectedStat === "seconds") return null;

	const axis = yAxisMap ? (Object.values(yAxisMap)[0] as any) : null;
	const scale = axis?.scale as ((v: number) => number) | undefined;

	if (!scale) return null;

	const yTop = scale(domainMax); // small pixel Y = top of chart
	const yBottom = scale(domainMin); // large pixel Y = bottom of chart

	// Shared helper: data value → "xx.x%" gradient offset
	const toOffset = (val: number) =>
		`${Math.max(0, Math.min(100, ((scale(val) - yTop) / (yBottom - yTop)) * 100)).toFixed(1)}%`;

	if (selectedStat === "fp") {
		const fp = GRADIENT_CONFIG.fp;
		return (
			<defs>
				<linearGradient
					id="rollingGrad"
					x1="0"
					y1={yTop}
					x2="0"
					y2={yBottom}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor={fp.brightGreen} />
					<stop
						offset={toOffset(fp.mean + 2 * fp.stdDev)}
						stopColor={fp.brightGreen}
					/>
					<stop
						offset={toOffset(fp.mean + fp.stdDev)}
						stopColor={fp.dimGreen}
					/>
					<stop offset={toOffset(fp.mean)} stopColor={fp.neutral} />
					<stop
						offset={toOffset(fp.mean - fp.stdDev)}
						stopColor={fp.dimRed}
					/>
					<stop
						offset={toOffset(fp.mean - 2 * fp.stdDev)}
						stopColor={fp.brightRed}
					/>
					<stop offset="100%" stopColor={fp.brightRed} />
				</linearGradient>
			</defs>
		);
	}

	if (selectedStat === "plus_minus") {
		const pm = GRADIENT_CONFIG.plusMinus;
		return (
			<defs>
				<linearGradient
					id="rollingGrad"
					x1="0"
					y1={yTop}
					x2="0"
					y2={yBottom}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0%" stopColor={pm.brightGreen} />
					<stop
						offset={toOffset(pm.brightThreshold)}
						stopColor={pm.brightGreen}
					/>
					<stop
						offset={toOffset(pm.dimThreshold)}
						stopColor={pm.dimGreen}
					/>
					<stop offset={toOffset(0)} stopColor={pm.neutral} />
					<stop
						offset={toOffset(-pm.dimThreshold)}
						stopColor={pm.dimRed}
					/>
					<stop
						offset={toOffset(-pm.brightThreshold)}
						stopColor={pm.brightRed}
					/>
					<stop offset="100%" stopColor={pm.brightRed} />
				</linearGradient>
			</defs>
		);
	}

	return null;
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
	month: string; // "yyyy-MM" for boundary detection
	monthLabel: string; // "Oct", "Nov", etc.
	oppTricode: string;
	isHome: boolean;
	value: number | null;
	rollingAvg: number | null;
	starter: boolean | null;
	played: boolean;
	seconds: number | null;
	notPlayingReason: string | null;
	// Full statline for tooltip
	pts: number | null;
	reb: number | null;
	ast: number | null;
	stl: number | null;
	blk: number | null;
	tov: number | null;
	fp: number | null;
	plusMinus: number | null;
	fgm: number | null;
	fga: number | null;
	tpm: number | null;
	tpa: number | null;
	ftm: number | null;
	fta: number | null;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		name: string;
		value: number | null;
		payload: ChartPoint;
	}>;
	teamColor: string | null;
}

function CustomTooltip({ active, payload, teamColor }: CustomTooltipProps) {
	if (!active || !payload?.length) return null;
	const point: ChartPoint = payload[0].payload;

	const n = (v: number | null) => v ?? 0;
	const shot = (m: number | null, a: number | null) =>
		a != null && a > 0 ? `${m ?? 0}/${a}` : "—";

	return (
		<div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg text-sm min-w-48">
			{/* Header */}
			<div className="flex items-center justify-between gap-3 mb-2">
				<div className="flex items-center gap-1.5">
					<span className="font-semibold text-foreground">
						{point.isHome ? "vs" : "@"} {point.oppTricode}
					</span>
					{point.starter != null && (
						<span
							className="text-[0.6rem] px-1 py-0.5 rounded font-medium uppercase tracking-wide"
							style={{
								backgroundColor: point.starter
									? `${teamColor ?? "#888"}30`
									: "hsl(var(--muted) / 0.5)",
								color: point.starter
									? (teamColor ?? "inherit")
									: "hsl(var(--muted-foreground))",
							}}
						>
							{point.starter ? "S" : "B"}
						</span>
					)}
				</div>
				<span className="text-xs text-muted-foreground tabular-nums">
					{point.dateLabel}
				</span>
			</div>

			{point.played ? (
				<>
					{/* Primary counting statline */}
					<div className="grid grid-cols-6 gap-x-2 gap-y-0.5 mb-2">
						{[
							{ label: "PTS", value: n(point.pts) },
							{ label: "REB", value: n(point.reb) },
							{ label: "AST", value: n(point.ast) },
							{ label: "STL", value: n(point.stl) },
							{ label: "BLK", value: n(point.blk) },
							{ label: "TOV", value: n(point.tov) },
						].map(({ label, value }) => (
							<div
								key={label}
								className="flex flex-col items-center"
							>
								<span className="text-sm font-bold tabular-nums leading-none">
									{value}
								</span>
								<span className="text-[0.5rem] uppercase tracking-wider text-muted-foreground">
									{label}
								</span>
							</div>
						))}
					</div>

					{/* Shooting splits */}
					<div className="grid grid-cols-3 gap-x-2 gap-y-0.5 mb-2">
						{[
							{ label: "FG", value: shot(point.fgm, point.fga) },
							{ label: "3P", value: shot(point.tpm, point.tpa) },
							{ label: "FT", value: shot(point.ftm, point.fta) },
						].map(({ label, value }) => (
							<div
								key={label}
								className="flex flex-col items-center"
							>
								<span className="text-sm font-bold tabular-nums leading-none">
									{value}
								</span>
								<span className="text-[0.5rem] uppercase tracking-wider text-muted-foreground">
									{label}
								</span>
							</div>
						))}
					</div>

					{/* Footer: time / +/- / FP */}
					<div className="grid grid-cols-3 pt-1.5 border-t border-border/40">
						<span className="text-xs tabular-nums text-muted-foreground">
							{point.seconds != null
								? formatSecondsToMMSS(point.seconds)
								: "—"}
						</span>
						<span
							className="text-xs font-semibold tabular-nums text-center"
							style={{
								color:
									point.plusMinus != null
										? valueToRGB({
												value: point.plusMinus,
												min: -20,
												max: 20,
												lowColor: [239, 68, 68, 1],
												midColor: [180, 180, 180, 1],
												highColor: [34, 197, 94, 1],
											})
										: undefined,
							}}
						>
							{point.plusMinus != null
								? `${point.plusMinus >= 0 ? "+" : ""}${point.plusMinus}`
								: "—"}
						</span>
						<span
							className="text-xs font-semibold tabular-nums text-right"
							style={{ color: teamColor ?? undefined }}
						>
							{point.fp != null ? point.fp.toFixed(1) : "—"} FP
						</span>
					</div>
				</>
			) : (
				<div className="text-muted-foreground text-xs">
					DNP
					{point.notPlayingReason
						? ` — ${point.notPlayingReason}`
						: ""}
				</div>
			)}
		</div>
	);
}

interface PerformanceChartProps {
	gameLogs: GameLogFull[];
	teamColor: string | null;
}

export function PerformanceChart({
	gameLogs,
	teamColor,
}: PerformanceChartProps) {
	const [selectedStat, setSelectedStat] = useState<StatKey>("fp");
	const [showRolling, setShowRolling] = useState(true);
	const [rollingWindow, setRollingWindow] = useState(5);

	const accent = teamColor ?? "#6366f1";

	const chartData = useMemo<ChartPoint[]>(() => {
		const playedLogs = gameLogs.filter((g) => g.played === true);

		const rawValues = playedLogs.map(
			(g) => g[selectedStat] as number | null,
		);
		const rolling = rollingAverage(
			rawValues.map((v) => v ?? 0),
			rollingWindow,
		);

		return gameLogs.map((g, allIdx) => {
			const playedIdx = playedLogs.indexOf(g);
			const rollingVal =
				g.played && playedIdx >= 0 ? rolling[playedIdx] : null;

			const opp = g.opp_team;
			const isHome = g.game?.team_home_id === g.team_id;
			const dt = g.game?.datetime
				? DateTime.fromISO(g.game.datetime).setZone("America/New_York")
				: null;

			return {
				gameIndex: allIdx,
				dateLabel: dt ? dt.toFormat("LLL d") : "",
				month: dt ? dt.toFormat("yyyy-MM") : "",
				monthLabel: dt ? dt.toFormat("LLL") : "",
				oppTricode: opp?.tricode ?? "???",
				isHome,
				value: g.played ? (g[selectedStat] as number | null) : null,
				rollingAvg: rollingVal,
				starter: g.starter ?? null,
				played: g.played ?? false,
				seconds: g.seconds ?? null,
				notPlayingReason: g.not_playing_reason ?? null,
				pts: g.points ?? null,
				reb: g.rebounds_total ?? null,
				ast: g.assists ?? null,
				stl: g.steals ?? null,
				blk: g.blocks ?? null,
				tov: g.turnovers ?? null,
				fp: g.fp ?? null,
				plusMinus: g.plus_minus ?? null,
				fgm: g.field_goals_made ?? null,
				fga: g.field_goals_attempted ?? null,
				tpm: g.three_pointers_made ?? null,
				tpa: g.three_pointers_attempted ?? null,
				ftm: g.free_throws_made ?? null,
				fta: g.free_throws_attempted ?? null,
			} satisfies ChartPoint;
		});
	}, [gameLogs, selectedStat, rollingWindow]);

	const dnpIndices = chartData
		.filter((d) => !d.played)
		.map((d) => d.gameIndex);

	// Month boundaries: first game index where each new month starts
	const monthBoundaries = useMemo(() => {
		const seen = new Set<string>();
		return chartData
			.filter((d) => {
				if (!d.month || seen.has(d.month)) return false;
				seen.add(d.month);
				return true;
			})
			.map((d) => ({ gameIndex: d.gameIndex, label: d.monthLabel }));
	}, [chartData]);

	const monthTickMap = useMemo(
		() =>
			Object.fromEntries(
				monthBoundaries.map((b) => [b.gameIndex, b.label]),
			),
		[monthBoundaries],
	);

	// Y-axis domain
	const playedValues = chartData
		.filter((d) => d.played && d.value != null)
		.map((d) => d.value as number);
	const yMin = playedValues.length ? Math.min(...playedValues) : 0;
	const yMax = playedValues.length ? Math.max(...playedValues) : 10;
	const yPad = Math.max((yMax - yMin) * 0.15, 2);

	// FP: always show at least 0–100; expand if data exceeds that range
	const yDomainMin =
		selectedStat === "fp"
			? Math.min(0, Math.floor(yMin - yPad))
			: Math.floor(yMin - yPad);
	const yDomainMax =
		selectedStat === "fp"
			? Math.max(60, Math.ceil(yMax + yPad))
			: Math.ceil(yMax + yPad);

	// FP ticks: every 20 from 0 up to domain max
	const yTicks =
		selectedStat === "fp"
			? Array.from(
					{ length: Math.floor(yDomainMax / 20) + 1 },
					(_, i) => i * 20,
				)
			: undefined;

	// Stable callback for Customized so it doesn't force a full chart re-render
	const GradientCustomized = useCallback(
		(chartProps: any) => (
			<RollingGradientDef
				yAxisMap={chartProps.yAxisMap}
				selectedStat={selectedStat}
				domainMin={yDomainMin}
				domainMax={yDomainMax}
			/>
		),
		[selectedStat, yDomainMin, yDomainMax],
	);

	const useGradientStroke =
		selectedStat === "fp" || selectedStat === "plus_minus";

	return (
		<div className="rounded-2xl border border-border/40 overflow-hidden  shadow-md">
			<div className="p-5 flex flex-col gap-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<h2 className="text-base font-semibold">
						Game-by-Game Performance
					</h2>

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
												backgroundColor:
													"hsl(var(--muted))",
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
								backgroundColor: showRolling
									? accent
									: "transparent",
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
							{/* Must be first child so <defs> lands in SVG before any <Line> */}
							<Customized component={GradientCustomized} />

							<CartesianGrid
								strokeDasharray="3 3"
								strokeOpacity={0.15}
								vertical={false}
							/>

							<XAxis
								dataKey="gameIndex"
								type="number"
								domain={[0, chartData.length - 1]}
								tickLine={false}
								axisLine={false}
								ticks={monthBoundaries.map((b) => b.gameIndex)}
								tickFormatter={(idx) => monthTickMap[idx] ?? ""}
								tick={{
									fontSize: 10,
									fill: "hsl(var(--muted-foreground))",
								}}
								height={20}
								interval={0}
							/>

							<YAxis
								domain={[yDomainMin, yDomainMax]}
								ticks={yTicks}
								tickLine={false}
								axisLine={false}
								tick={{
									fontSize: 11,
									fill: "hsl(var(--muted-foreground))",
								}}
								width={32}
							/>

							<Tooltip
								content={
									<CustomTooltip teamColor={teamColor} />
								}
								cursor={{
									stroke: "hsl(var(--border))",
									strokeWidth: 1,
									strokeDasharray: "4 2",
								}}
							/>

							{/* Zero reference line for +/- */}
							{selectedStat === "plus_minus" && (
								<ReferenceLine
									y={0}
									stroke="hsl(var(--muted-foreground))"
									strokeOpacity={0.45}
									strokeWidth={1}
									strokeDasharray="5 3"
								/>
							)}

							{/* DNP markers */}
							{dnpIndices.map((idx) => (
								<ReferenceLine
									key={idx}
									x={idx}
									stroke="hsl(var(--muted-foreground))"
									strokeOpacity={0.3}
									strokeDasharray="2 4"
									strokeWidth={1}
								/>
							))}

							{/* Raw per-game line */}
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

							{/* Rolling average line — gradient for FP and +/-, solid accent for MIN */}
							{showRolling && (
								<Line
									dataKey="rollingAvg"
									stroke={
										useGradientStroke
											? "url(#rollingGrad)"
											: accent
									}
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

				{dnpIndices.length > 0 && (
					<p className="text-[0.65rem] text-muted-foreground/60 text-right">
						Dashed lines mark DNP games ({dnpIndices.length})
					</p>
				)}
			</div>
		</div>
	);
}
