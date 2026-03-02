"use client";

import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { createClient } from "@/lib/supabase/client";
import { TeamLogo } from "@/components/ui/team-logo";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type GameWeek = {
	number: number;
	label: string | null;
	start_date: string | null;
	end_date: string | null;
};

type Team = {
	id: string;
	tricode: string | null;
	name: string | null;
	city: string | null;
	color_primary_hex: string | null;
};

type Game = {
	id: string;
	datetime: string | null;
	team_home_id: string | null;
	team_away_id: string | null;
	status_code: number | null;
	team_home_score: number | null;
	team_away_score: number | null;
	home_team: { id: string; tricode: string | null; color_primary_hex: string | null } | null;
	away_team: { id: string; tricode: string | null; color_primary_hex: string | null } | null;
};

type SortDir = "asc" | "desc";

function weekLabel(week: GameWeek) {
	const start = week.start_date ? DateTime.fromISO(week.start_date).toFormat("MMM d") : "";
	const end = week.end_date ? DateTime.fromISO(week.end_date).toFormat("MMM d") : "";
	return `Wk ${week.number}: ${start} – ${end}`;
}

export function ScheduleGrid() {
	const [weeks, setWeeks] = useState<GameWeek[]>([]);
	const [activeWeekIdx, setActiveWeekIdx] = useState(0);
	const [teams, setTeams] = useState<Team[]>([]);
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortCol, setSortCol] = useState<string>("team");
	const [sortDir, setSortDir] = useState<SortDir>("asc");

	function handleSort(col: string) {
		if (sortCol === col) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortCol(col);
			// Team defaults asc (A→Z); game/day columns default desc (most first)
			setSortDir(col === "team" ? "asc" : "desc");
		}
	}

	// Fetch weeks + teams on mount
	useEffect(() => {
		const supabase = createClient();
		async function load() {
			const [weeksRes, teamsRes] = await Promise.all([
				supabase
					.from("game_week_fantasy")
					.select("*")
					.eq("provider", "yahoo")
					.order("number"),
				supabase
					.from("team")
					.select("id, tricode, name, city, color_primary_hex")
					.eq("nba", true)
					.order("tricode"),
			]);

			const fetchedWeeks = weeksRes.data ?? [];
			setWeeks(fetchedWeeks);
			setTeams(teamsRes.data ?? []);

			const todayET = DateTime.now().setZone("America/New_York").toISODate();
			const currentIdx = fetchedWeeks.findIndex(
				(w) =>
					w.start_date &&
					w.end_date &&
					todayET &&
					w.start_date <= todayET &&
					todayET <= w.end_date,
			);
			setActiveWeekIdx(currentIdx >= 0 ? currentIdx : 0);
		}
		load();
	}, []);

	// Fetch games when active week changes
	useEffect(() => {
		if (!weeks.length) return;
		const week = weeks[activeWeekIdx];
		if (!week?.start_date || !week?.end_date) return;

		const supabase = createClient();
		setLoading(true);

		const startUTC = DateTime.fromISO(week.start_date, { zone: "America/New_York" })
			.startOf("day")
			.toUTC()
			.toISO();
		const endUTC = DateTime.fromISO(week.end_date, { zone: "America/New_York" })
			.endOf("day")
			.toUTC()
			.toISO();

		if (!startUTC || !endUTC) return;

		supabase
			.from("game")
			.select(
				`id, datetime, team_home_id, team_away_id, status_code, team_home_score, team_away_score,
				home_team:team_home_id(id, tricode, color_primary_hex),
				away_team:team_away_id(id, tricode, color_primary_hex)`,
			)
			.gte("datetime", startUTC)
			.lte("datetime", endUTC)
			.then(({ data }) => {
				setGames((data as Game[]) ?? []);
				setLoading(false);
			});
	}, [weeks, activeWeekIdx]);

	const week = weeks[activeWeekIdx];

	// Days array for this week
	const days = useMemo<string[]>(() => {
		if (!week?.start_date || !week?.end_date) return [];
		const result: string[] = [];
		let current = DateTime.fromISO(week.start_date, { zone: "America/New_York" });
		const end = DateTime.fromISO(week.end_date, { zone: "America/New_York" });
		while (current <= end) {
			result.push(current.toISODate()!);
			current = current.plus({ days: 1 });
		}
		return result;
	}, [week]);

	// Cell lookup + game counts
	const { cells, dayGameCounts, teamGameCounts } = useMemo(() => {
		const cells: Record<string, Record<string, Game>> = {};
		const dayGameCounts: Record<string, number> = {};
		const teamGameCounts: Record<string, number> = {};

		for (const game of games) {
			if (!game.datetime) continue;
			const dateET = DateTime.fromISO(game.datetime, { zone: "UTC" })
				.setZone("America/New_York")
				.toISODate();
			if (!dateET) continue;

			dayGameCounts[dateET] = (dayGameCounts[dateET] ?? 0) + 1;

			if (game.team_home_id) {
				if (!cells[game.team_home_id]) cells[game.team_home_id] = {};
				cells[game.team_home_id][dateET] = game;
				teamGameCounts[game.team_home_id] = (teamGameCounts[game.team_home_id] ?? 0) + 1;
			}
			if (game.team_away_id) {
				if (!cells[game.team_away_id]) cells[game.team_away_id] = {};
				cells[game.team_away_id][dateET] = game;
				teamGameCounts[game.team_away_id] = (teamGameCounts[game.team_away_id] ?? 0) + 1;
			}
		}

		return { cells, dayGameCounts, teamGameCounts };
	}, [games]);

	// Sorted teams
	const sortedTeams = useMemo(() => {
		const arr = [...teams];
		const dir = sortDir === "asc" ? 1 : -1;

		arr.sort((a, b) => {
			if (sortCol === "team") {
				return dir * (a.tricode ?? "").localeCompare(b.tricode ?? "");
			}
			if (sortCol === "G") {
				const diff = (teamGameCounts[a.id] ?? 0) - (teamGameCounts[b.id] ?? 0);
				if (diff !== 0) return dir * diff;
				return (a.tricode ?? "").localeCompare(b.tricode ?? "");
			}
			// Day column: has-game boolean, then G count, then tricode
			const hasA = cells[a.id]?.[sortCol] ? 1 : 0;
			const hasB = cells[b.id]?.[sortCol] ? 1 : 0;
			if (hasA !== hasB) return dir * (hasA - hasB);
			const gDiff = (teamGameCounts[a.id] ?? 0) - (teamGameCounts[b.id] ?? 0);
			if (gDiff !== 0) return dir * gDiff;
			return (a.tricode ?? "").localeCompare(b.tricode ?? "");
		});

		return arr;
	}, [teams, sortCol, sortDir, cells, teamGameCounts]);

	const todayET = DateTime.now().setZone("America/New_York").toISODate();
	const isCurrentWeek =
		week?.start_date &&
		week?.end_date &&
		todayET &&
		week.start_date <= todayET &&
		todayET <= week.end_date;

	return (
		<div className="w-full flex flex-col gap-4">
			{/* Week navigation */}
			<div className="flex items-center gap-2 px-2">
				<button
					onClick={() => setActiveWeekIdx((i) => Math.max(0, i - 1))}
					disabled={activeWeekIdx === 0}
					className="flex items-center justify-center size-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
				>
					<ChevronLeft size={15} />
				</button>

				<Select
					value={String(activeWeekIdx)}
					onValueChange={(val) => setActiveWeekIdx(Number(val))}
				>
					<SelectTrigger className="w-48 h-8 text-sm font-medium">
						<SelectValue>{week ? weekLabel(week) : "Loading…"}</SelectValue>
					</SelectTrigger>
					<SelectContent className="max-h-72">
						{weeks.map((w, i) => (
							<SelectItem key={w.number} value={String(i)}>
								{weekLabel(w)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<button
					onClick={() => setActiveWeekIdx((i) => Math.min(weeks.length - 1, i + 1))}
					disabled={activeWeekIdx >= weeks.length - 1}
					className="flex items-center justify-center size-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
				>
					<ChevronRight size={15} />
				</button>
			</div>

			{/* Grid */}
			<div className="overflow-x-auto rounded-md border border-border">
				<table className="w-full border-collapse text-sm" style={{ minWidth: 480 }}>
					<thead>
						<tr className="border-b border-border bg-muted/30">
							{/* Team header */}
							<th className="sticky left-0 z-10 bg-muted/30 border-r border-border">
								<ColHeader
									label="Team"
									col="team"
									sortCol={sortCol}
									sortDir={sortDir}
									onSort={handleSort}
									align="left"
									className="px-3 py-2.5 w-28"
								/>
							</th>
							{/* G column header */}
							<th className="border-r border-border">
								<ColHeader
									label="G"
									col="G"
									sortCol={sortCol}
									sortDir={sortDir}
									onSort={handleSort}
									className="px-2 py-2.5 w-10"
								/>
							</th>
							{/* Day headers */}
							{days.map((day) => {
								const dt = DateTime.fromISO(day);
								const isToday = day === todayET;
								const count = dayGameCounts[day] ?? 0;
								return (
									<th
										key={day}
										className={`border-r border-border last:border-r-0 ${
											isToday && isCurrentWeek ? "bg-primary/8" : ""
										}`}
									>
										<ColHeader
											col={day}
											sortCol={sortCol}
											sortDir={sortDir}
											onSort={handleSort}
											className={`px-2 py-2.5 min-w-[76px] ${
												isToday && isCurrentWeek
													? "text-foreground"
													: "text-muted-foreground"
											}`}
										>
											<div className="text-xs uppercase tracking-wider font-medium">
												{dt.toFormat("EEE")}
											</div>
											<div className="text-[10px] font-normal normal-case tracking-normal opacity-60">
												{dt.toFormat("M/d")}
											</div>
											{!loading && count > 0 && (
												<div className="mt-0.5 text-[10px] font-semibold normal-case tracking-normal opacity-50">
													{count}G
												</div>
											)}
										</ColHeader>
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{loading
							? Array.from({ length: 15 }).map((_, i) => (
									<tr key={i} className="border-b border-border animate-pulse">
										<td className="sticky left-0 z-10 bg-background px-3 py-2.5 border-r border-border">
											<div className="h-4 w-16 rounded bg-muted" />
										</td>
										<td className="px-2 py-2.5 border-r border-border">
											<div className="h-4 w-4 rounded bg-muted mx-auto" />
										</td>
										{Array.from({ length: days.length || 7 }).map((_, j) => (
											<td
												key={j}
												className="px-2 py-2.5 border-r border-border last:border-r-0"
											>
												{i % 3 !== j % 3 && (
													<div className="h-4 w-12 rounded bg-muted mx-auto" />
												)}
											</td>
										))}
									</tr>
							  ))
							: sortedTeams.map((team) => {
									const teamCells = cells[team.id] ?? {};
									const gamesCount = teamGameCounts[team.id] ?? 0;
									const hasGame = gamesCount > 0;

									return (
										<tr
											key={team.id}
											className={`border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors ${
												!hasGame ? "opacity-40" : ""
											}`}
										>
											{/* Team column — sticky */}
											<td className="sticky left-0 z-10 bg-background px-3 py-2 border-r border-border">
												<div className="flex items-center gap-2">
													<TeamLogo teamId={team.id} size={18} />
													<span className="font-bold text-xs text-foreground tracking-wide">
														{team.tricode}
													</span>
												</div>
											</td>

											{/* Team game count */}
											<td className="px-2 py-2 text-center border-r border-border">
												<span
													className={`text-xs font-semibold tabular-nums ${
														gamesCount >= 4
															? "text-foreground"
															: gamesCount >= 3
																? "text-foreground/70"
																: "text-muted-foreground"
													}`}
												>
													{hasGame ? gamesCount : ""}
												</span>
											</td>

											{/* Game cells */}
											{days.map((day) => {
												const game = teamCells[day];
												const isToday = day === todayET;

												return (
													<td
														key={day}
														className={`px-1 py-2 text-center border-r border-border last:border-r-0 ${
															isToday && isCurrentWeek ? "bg-primary/5" : ""
														}`}
													>
														{game ? (
															<GameCell game={game} teamId={team.id} />
														) : null}
													</td>
												);
											})}
										</tr>
									);
							  })}
					</tbody>
				</table>
			</div>
		</div>
	);
}

// Sortable column header button
function ColHeader({
	label,
	col,
	sortCol,
	sortDir,
	onSort,
	align = "center",
	className,
	children,
}: {
	label?: string;
	col: string;
	sortCol: string;
	sortDir: SortDir;
	onSort: (col: string) => void;
	align?: "left" | "center";
	className?: string;
	children?: React.ReactNode;
}) {
	const isActive = sortCol === col;
	return (
		<button
			onClick={() => onSort(col)}
			className={`w-full flex flex-col ${align === "left" ? "items-start" : "items-center"} gap-0 cursor-pointer select-none text-xs uppercase tracking-wider font-medium text-muted-foreground hover:text-foreground transition-colors ${className ?? ""}`}
		>
			{children ?? (
				<span className="flex items-center gap-1">
					{label}
					{isActive ? (
						sortDir === "asc" ? (
							<ArrowUp size={10} className="text-foreground" />
						) : (
							<ArrowDown size={10} className="text-foreground" />
						)
					) : null}
				</span>
			)}
			{/* For day columns — show sort indicator below the date info */}
			{children && isActive && (
				<span className="mt-0.5">
					{sortDir === "asc" ? (
						<ArrowUp size={10} className="text-foreground" />
					) : (
						<ArrowDown size={10} className="text-foreground" />
					)}
				</span>
			)}
		</button>
	);
}

function GameCell({ game, teamId }: { game: Game; teamId: string }) {
	const isHome = game.team_home_id === teamId;
	const oppTeam = isHome ? game.away_team : game.home_team;
	const prefix = isHome ? "vs" : "@";
	const isFinal = game.status_code === 3;

	const teamScore = isHome ? game.team_home_score : game.team_away_score;
	const oppScore = isHome ? game.team_away_score : game.team_home_score;
	const won = isFinal && teamScore !== null && oppScore !== null && teamScore > oppScore;

	return (
		<div className="flex flex-col items-center gap-0.5">
			<div className="flex items-center gap-1">
				<span className="text-muted-foreground/50 text-[10px]">{prefix}</span>
				{oppTeam && <TeamLogo teamId={oppTeam.id} size={14} />}
				<span className="text-[11px] font-semibold text-foreground/80">
					{oppTeam?.tricode ?? "—"}
				</span>
			</div>
			{isFinal && teamScore !== null && oppScore !== null && (
				<div
					className={`text-[10px] font-mono leading-none tabular-nums ${
						won ? "text-green-500" : "text-muted-foreground"
					}`}
				>
					{won ? "W" : "L"} {teamScore}–{oppScore}
				</div>
			)}
		</div>
	);
}
