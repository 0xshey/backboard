"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { valueToRGB, getContrastingColor } from "@/lib/value-to-color";
import { formatSecondsToMMSS } from "@/lib/utils";
import type {
	GameLogFull,
	GameWeekRow,
} from "@/app/(app)/player/[playerId]/page";
import { Badge } from "../ui/badge";

interface WeekSummary {
	week: GameWeekRow;
	games: GameLogFull[];
	totalFP: number | null;
	avgFP: number | null;
}

/**
 * game.datetime is stored as UTC. Convert it to the Eastern calendar date
 * (YYYY-MM-DD) so it can be compared against week.start_date / end_date,
 * which are Eastern calendar dates (not UTC).
 *
 * e.g. a Sunday night game at 23:30 ET = 03:30 UTC Monday — without this
 * conversion the game would fall into the following week.
 */
function utcToEasternDate(utcDatetime: string): string {
	return new Date(utcDatetime).toLocaleDateString("en-CA", {
		timeZone: "America/New_York",
	});
}

/**
 * game.datetime is UTC — format it as "Mon D" in Eastern Time for display.
 */
function utcToEasternLabel(utcDatetime: string): string {
	return new Date(utcDatetime).toLocaleDateString("en-US", {
		timeZone: "America/New_York",
		month: "short",
		day: "numeric",
	});
}

/**
 * week.start_date / end_date are Eastern calendar date strings (YYYY-MM-DD),
 * NOT UTC timestamps. Passing them directly to `new Date()` would interpret
 * them as UTC midnight, shifting the displayed date by up to a day in ET.
 * Parse the parts explicitly to build a local-midnight Date for display only.
 */
function easternDateStringToDisplay(dateStr: string): string {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(y, m - 1, d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function buildWeekSummaries(
	gameWeeks: GameWeekRow[],
	gameLogs: GameLogFull[],
): WeekSummary[] {
	return gameWeeks.map((week) => {
		const { start_date, end_date } = week;

		const games = gameLogs.filter((log) => {
			if (!log.game?.datetime || !start_date || !end_date) return false;
			// Convert the UTC game timestamp to an Eastern calendar date before
			// comparing against the Eastern date boundaries of the week.
			const gameDate = utcToEasternDate(log.game.datetime);
			return (
				gameDate >= start_date &&
				gameDate <= end_date &&
				log.played === true
			);
		});

		const fpVals = games
			.map((g) => g.fp)
			.filter((v): v is number => v != null);

		const totalFP =
			fpVals.length > 0 ? fpVals.reduce((a, b) => a + b, 0) : null;
		const avgFP = fpVals.length > 0 ? totalFP! / fpVals.length : null;

		return { week, games, totalFP, avgFP };
	});
}

function fmt(v: number | null, decimals = 1): string {
	return v != null ? v.toFixed(decimals) : "—";
}

function formatDateRange(start: string | null, end: string | null): string {
	if (!start || !end) return "";
	// start/end are Eastern calendar date strings — use easternDateStringToDisplay
	// rather than new Date() to avoid UTC-midnight interpretation shifting the day.
	return `${easternDateStringToDisplay(start)} – ${easternDateStringToDisplay(end)}`;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface GameTooltipProps {
	game: GameLogFull;
	teamColor: string | null;
}

function GameTooltip({ game: g, teamColor }: GameTooltipProps) {
	const n = (v: number | null | undefined) => v ?? 0;
	const shot = (
		m: number | null | undefined,
		a: number | null | undefined,
	) => (a != null && a > 0 ? `${m ?? 0}/${a}` : "—");

	const isHome = g.game?.team_home_id === g.team_id;
	const dateLabel = g.game?.datetime
		? utcToEasternLabel(g.game.datetime)
		: "";

	return (
		<div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-lg text-sm min-w-48 pointer-events-none">
			{/* Header */}
			<div className="flex items-center justify-between gap-3 mb-2">
				<div className="flex items-center gap-1.5">
					<span className="font-semibold text-foreground">
						{isHome ? "vs" : "@"} {g.opp_team?.tricode ?? "—"}
					</span>
					{g.starter != null && (
						<span
							className="text-[0.6rem] px-1 py-0.5 rounded font-medium uppercase tracking-wide"
							style={{
								backgroundColor: g.starter
									? `${teamColor ?? "#888"}30`
									: "hsl(var(--muted) / 0.5)",
								color: g.starter
									? (teamColor ?? "inherit")
									: "hsl(var(--muted-foreground))",
							}}
						>
							{g.starter ? "S" : "B"}
						</span>
					)}
				</div>
				<span className="text-xs text-muted-foreground tabular-nums">
					{dateLabel}
				</span>
			</div>

			{/* Counting stats */}
			<div className="grid grid-cols-6 gap-x-2 gap-y-0.5 mb-2">
				{[
					{ label: "PTS", value: n(g.points) },
					{ label: "REB", value: n(g.rebounds_total) },
					{ label: "AST", value: n(g.assists) },
					{ label: "STL", value: n(g.steals) },
					{ label: "BLK", value: n(g.blocks) },
					{ label: "TOV", value: n(g.turnovers) },
				].map(({ label, value }) => (
					<div key={label} className="flex flex-col items-center">
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
					{
						label: "FG",
						value: shot(
							g.field_goals_made,
							g.field_goals_attempted,
						),
					},
					{
						label: "3P",
						value: shot(
							g.three_pointers_made,
							g.three_pointers_attempted,
						),
					},
					{
						label: "FT",
						value: shot(
							g.free_throws_made,
							g.free_throws_attempted,
						),
					},
				].map(({ label, value }) => (
					<div key={label} className="flex flex-col items-center">
						<span className="text-sm font-bold tabular-nums leading-none">
							{value}
						</span>
						<span className="text-[0.5rem] uppercase tracking-wider text-muted-foreground">
							{label}
						</span>
					</div>
				))}
			</div>

			{/* Footer: MIN / +/- / FP */}
			<div className="grid grid-cols-3 pt-1.5 border-t border-border/40">
				<span className="text-xs tabular-nums text-muted-foreground">
					{g.seconds != null ? formatSecondsToMMSS(g.seconds) : "—"}
				</span>
				<span
					className="text-xs font-semibold tabular-nums text-center"
					style={{
						color:
							g.plus_minus != null
								? valueToRGB({
										value: g.plus_minus,
										min: -20,
										max: 20,
										lowColor: [239, 68, 68, 1],
										midColor: [180, 180, 180, 1],
										highColor: [34, 197, 94, 1],
									})
								: undefined,
					}}
				>
					{g.plus_minus != null
						? `${g.plus_minus >= 0 ? "+" : ""}${g.plus_minus}`
						: "—"}
				</span>
				<span
					className="text-xs font-semibold tabular-nums text-right"
					style={{ color: teamColor ?? undefined }}
				>
					{g.fp != null ? g.fp.toFixed(1) : "—"} FP
				</span>
			</div>
		</div>
	);
}

// ─── Sort UI ──────────────────────────────────────────────────────────────────

type SortKey = "week" | "total" | "avg";
type SortDir = "asc" | "desc";

const COL_WEEK = "w-24 shrink-0";
const COL_STAT = "w-14 shrink-0";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
	if (!active) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
	return dir === "asc" ? (
		<ChevronUp className="w-3 h-3" />
	) : (
		<ChevronDown className="w-3 h-3" />
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PlayerWeeklyPerformanceProps {
	gameLogs: GameLogFull[];
	gameWeeks: GameWeekRow[];
	teamColor: string | null;
}

export function PlayerWeeklyPerformance({
	gameLogs,
	gameWeeks,
	teamColor,
}: PlayerWeeklyPerformanceProps) {
	const [sortKey, setSortKey] = useState<SortKey>("week");
	const [sortDir, setSortDir] = useState<SortDir>("asc");
	const [isDark, setIsDark] = useState(false);
	const [hoveredGameId, setHoveredGameId] = useState<string | null>(null);

	useEffect(() => {
		const el = document.documentElement;
		const check = () => setIsDark(el.classList.contains("dark"));
		check();
		const observer = new MutationObserver(check);
		observer.observe(el, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, []);

	const summaries = buildWeekSummaries(gameWeeks, gameLogs);

	// Compare as Eastern date strings (YYYY-MM-DD) to avoid UTC midnight
	// misinterpreting week.start_date and potentially hiding the current week
	// on Monday morning ET (when UTC is already into the next calendar day).
	const todayET = new Date().toLocaleDateString("en-CA", {
		timeZone: "America/New_York",
	});
	const past = summaries.filter(
		(s) => s.week.start_date && s.week.start_date <= todayET,
	);

	if (past.length === 0) return null;

	const handleSort = (key: SortKey) => {
		if (key === sortKey) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir("asc");
		}
	};

	const sorted = [...past].sort((a, b) => {
		let cmp = 0;
		if (sortKey === "week") cmp = a.week.number - b.week.number;
		else if (sortKey === "total")
			cmp = (a.totalFP ?? -Infinity) - (b.totalFP ?? -Infinity);
		else cmp = (a.avgFP ?? -Infinity) - (b.avgFP ?? -Infinity);
		return sortDir === "asc" ? cmp : -cmp;
	});

	const fpColor = (fp: number | null) => {
		if (fp == null) return null;
		return valueToRGB({
			value: fp,
			min: 0,
			max: 60,
			lowColor: [239, 68, 68, 1],
			midColor: isDark ? [30, 30, 32, 1] : [210, 210, 214, 1],
			highColor: [34, 197, 94, 1],
		});
	};

	const SortBtn = ({
		col,
		children,
		className = "",
	}: {
		col: SortKey;
		children: React.ReactNode;
		className?: string;
	}) => (
		<button
			onClick={() => handleSort(col)}
			className={`flex items-center gap-0.5 text-[0.6rem] uppercase tracking-wider font-medium transition-colors ${
				sortKey === col
					? "text-foreground"
					: "text-muted-foreground hover:text-foreground"
			} ${className}`}
		>
			{children}
			<SortIcon active={sortKey === col} dir={sortDir} />
		</button>
	);

	return (
		<div className="rounded-2xl border border-border/40 overflow-hidden shadow-md">
			{/* Title */}
			<div className="px-5 pt-4 pb-3 flex items-center gap-4">
				<h2 className="text-base font-semibold">Weekly Performance</h2>
				<Badge variant={"outline"}>Beta</Badge>
			</div>

			{/* Column headers */}
			<div className="flex items-center gap-4 px-5 pb-2 border-b border-border/40">
				<SortBtn col="week" className={COL_WEEK}>
					Week
				</SortBtn>
				<div className="flex-1" />
				<div className="flex items-center gap-2 shrink-0">
					<SortBtn col="avg" className={`${COL_STAT} justify-center`}>
						Avg
					</SortBtn>
					<SortBtn
						col="total"
						className={`${COL_STAT} justify-center`}
					>
						Total
					</SortBtn>
				</div>
			</div>

			{/* Rows */}
			<div className="divide-y divide-border/40">
				{sorted.map(({ week, games, totalFP, avgFP }) => {
					const avgColor = fpColor(avgFP);

					return (
						<div
							key={`${week.provider}-${week.number}`}
							className="flex items-center gap-4 px-5 py-2.5"
						>
							{/* Week */}
							<div className={COL_WEEK}>
								<p className="text-sm font-semibold leading-tight">
									{week.label ?? `Week ${week.number}`}
								</p>
								<p className="text-[0.65rem] text-muted-foreground mt-0.5">
									{formatDateRange(
										week.start_date,
										week.end_date,
									)}
								</p>
							</div>

							{/* Game FP pills */}
							<div className="flex items-center gap-1.5 flex-1 flex-wrap">
								{games.length === 0 ? (
									<span className="text-xs text-muted-foreground/50 italic">
										No games
									</span>
								) : (
									games.map((g) => {
										const bg = fpColor(g.fp);
										const isHovered =
											hoveredGameId === g.game_id;
										return (
											<div
												key={g.game_id}
												className="relative"
												onMouseEnter={() =>
													setHoveredGameId(g.game_id)
												}
												onMouseLeave={() =>
													setHoveredGameId(null)
												}
											>
												{/* Tooltip */}
												{isHovered && (
													<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50">
														<GameTooltip
															game={g}
															teamColor={
																teamColor
															}
														/>
													</div>
												)}

												{/* Pill */}
												<div
													className="flex flex-col items-center rounded-md px-2 py-1 min-w-10 cursor-default"
													style={{
														background:
															bg ??
															"hsl(var(--muted) / 0.6)",
														color: bg
															? getContrastingColor(
																	bg,
																)
															: undefined,
													}}
												>
													<span className="text-xs font-bold tabular-nums leading-none">
														{g.fp != null
															? g.fp.toFixed(1)
															: "—"}
													</span>
													<span className="text-[0.5rem] uppercase tracking-wider mt-0.5 font-medium opacity-60">
														{g.opp_team?.tricode ??
															"?"}
													</span>
												</div>
											</div>
										);
									})
								)}
							</div>

							{/* Avg + Total */}
							<div className="flex items-center gap-2 shrink-0">
								<div
									className={`${COL_STAT} flex flex-col items-center rounded-md py-1`}
									style={{
										background:
											avgColor ??
											"hsl(var(--muted) / 0.4)",
										color: avgColor
											? getContrastingColor(avgColor)
											: undefined,
									}}
								>
									<span className="text-sm font-semibold tabular-nums leading-none">
										{fmt(avgFP)}
									</span>
								</div>
								<div
									className={`${COL_STAT} flex flex-col items-center rounded-md py-1`}
									style={{
										background: "hsl(var(--muted) / 0.4)",
									}}
								>
									<span className="text-sm font-semibold tabular-nums leading-none">
										{fmt(totalFP)}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
