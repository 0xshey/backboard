"use client";

import { useMemo } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { DateTime } from "luxon";
import type { GameLogFull } from "@/app/(app)/player/[playerId]/page";

interface ShotSplitPoint {
	label: string;
	twoPA: number;
	threePA: number;
	ftA: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ name: string; value: number; fill: string }>;
	label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
	if (!active || !payload?.length) return null;

	const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0);

	return (
		<div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg text-sm min-w-36">
			<p className="font-semibold text-xs text-muted-foreground mb-2 uppercase tracking-wide">
				{label}
			</p>
			{payload.map((p) => (
				<div
					key={p.name}
					className="flex items-center justify-between gap-3"
				>
					<div className="flex items-center gap-1.5">
						<span
							className="inline-block w-2 h-2 rounded-full"
							style={{ backgroundColor: p.fill }}
						/>
						<span className="text-xs text-muted-foreground">{p.name}</span>
					</div>
					<span className="font-semibold tabular-nums text-xs">{p.value}</span>
				</div>
			))}
			<div className="mt-1 pt-1 border-t border-border/40 flex justify-between">
				<span className="text-xs text-muted-foreground">Total FGA</span>
				<span className="text-xs font-semibold tabular-nums">{total}</span>
			</div>
		</div>
	);
}

interface ShootingSplitsChartProps {
	gameLogs: GameLogFull[];
	teamColor: string | null;
}

export function ShootingSplitsChart({
	gameLogs,
	teamColor,
}: ShootingSplitsChartProps) {
	const accent = teamColor ?? "#6366f1";

	// Compute per-game averages for 2P, 3P, FT attempts
	const seasonAvgs = useMemo(() => {
		if (!gameLogs.length) return null;
		const mean = (field: keyof GameLogFull) => {
			const vals = gameLogs
				.map((g) => g[field] as number | null)
				.filter((v): v is number => v != null);
			if (!vals.length) return 0;
			return vals.reduce((a, b) => a + b, 0) / vals.length;
		};

		return {
			twoPA: mean("two_pointers_attempted"),
			threePA: mean("three_pointers_attempted"),
			ftA: mean("free_throws_attempted"),
		};
	}, [gameLogs]);

	// Build chart data: one bar group per game
	const chartData = useMemo<ShotSplitPoint[]>(() => {
		return gameLogs.map((g) => ({
			label: g.game?.datetime
				? DateTime.fromISO(g.game.datetime)
						.setZone("America/New_York")
						.toFormat("LLL d")
				: "—",
			twoPA: g.two_pointers_attempted ?? 0,
			threePA: g.three_pointers_attempted ?? 0,
			ftA: g.free_throws_attempted ?? 0,
		}));
	}, [gameLogs]);

	if (!chartData.length) return null;

	// Color palette for the three shot types
	const colors = {
		twoPA: `${accent}cc`,
		threePA: `${accent}80`,
		ftA: `${accent}44`,
	};

	return (
		<div className="rounded-2xl border border-border/40 overflow-hidden">
			<div className="p-5 flex flex-col gap-4">
				<div className="flex items-center justify-between gap-2">
					<h2 className="text-base font-semibold">Shooting Volume</h2>
					<div className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
						<span>Attempts per game</span>
					</div>
				</div>

				{/* Season averages summary */}
				{seasonAvgs && (
					<div className="flex items-center gap-3 flex-wrap">
						{[
							{ label: "2PA/G", value: seasonAvgs.twoPA, color: colors.twoPA },
							{
								label: "3PA/G",
								value: seasonAvgs.threePA,
								color: colors.threePA,
							},
							{ label: "FTA/G", value: seasonAvgs.ftA, color: colors.ftA },
						].map(({ label, value, color }) => (
							<div
								key={label}
								className="flex items-center gap-1.5 rounded-lg bg-muted/30 px-3 py-1.5"
							>
								<span
									className="inline-block w-2.5 h-2.5 rounded-full"
									style={{ backgroundColor: color }}
								/>
								<span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground font-medium">
									{label}
								</span>
								<span className="text-sm font-semibold tabular-nums">
									{value.toFixed(1)}
								</span>
							</div>
						))}
					</div>
				)}

				{/* Bar chart */}
				<div className="h-48 sm:h-56 -mx-2">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart
							data={chartData}
							margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
							barGap={0}
							barCategoryGap="20%"
						>
							<CartesianGrid
								strokeDasharray="3 3"
								strokeOpacity={0.12}
								vertical={false}
							/>

							<XAxis
								dataKey="label"
								tickLine={false}
								axisLine={false}
								tick={false}
								height={4}
							/>

							<YAxis
								tickLine={false}
								axisLine={false}
								tick={{
									fontSize: 10,
									fill: "hsl(var(--muted-foreground))",
								}}
								width={28}
							/>

							<Tooltip
								content={<CustomTooltip />}
								cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
							/>

							<Bar
								dataKey="twoPA"
								name="2-Pt Att"
								stackId="a"
								fill={colors.twoPA}
								radius={[0, 0, 0, 0]}
								isAnimationActive={false}
							/>
							<Bar
								dataKey="threePA"
								name="3-Pt Att"
								stackId="a"
								fill={colors.threePA}
								isAnimationActive={false}
							/>
							<Bar
								dataKey="ftA"
								name="FT Att"
								stackId="a"
								fill={colors.ftA}
								radius={[3, 3, 0, 0]}
								isAnimationActive={false}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>

				{/* Manual legend */}
				<div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground justify-end -mt-2">
					{[
						{ label: "2-Pt Att", color: colors.twoPA },
						{ label: "3-Pt Att", color: colors.threePA },
						{ label: "FT Att", color: colors.ftA },
					].map(({ label, color }) => (
						<div key={label} className="flex items-center gap-1.5">
							<span
								className="inline-block w-2.5 h-2.5 rounded-sm"
								style={{ backgroundColor: color }}
							/>
							<span>{label}</span>
						</div>
					))}
				</div>

				{/* X-axis date labels */}
				<div className="flex justify-between text-[0.6rem] text-muted-foreground px-8 -mt-3">
					{chartData.length > 0 && (
						<>
							<span>{chartData[0].label}</span>
							{chartData.length > 2 && (
								<span>
									{chartData[Math.floor(chartData.length / 2)].label}
								</span>
							)}
							<span>{chartData[chartData.length - 1].label}</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
