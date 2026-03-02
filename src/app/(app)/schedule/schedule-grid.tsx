"use client";

import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { createClient } from "@/lib/supabase/client";
import { TeamLogo } from "@/components/ui/team-logo";
import {
	ChevronLeft,
	ChevronRight,
	ArrowDown,
	ArrowDownAZ,
	ArrowDownZA,
	ArrowDown01,
	ArrowDown10,
} from "lucide-react";
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
	home_team: {
		id: string;
		tricode: string | null;
		color_primary_hex: string | null;
	} | null;
	away_team: {
		id: string;
		tricode: string | null;
		color_primary_hex: string | null;
	} | null;
};

// 4-state cycle for the team column sort icon
const TEAM_SORT_ICONS = [
	ArrowDownAZ, // 0: alpha asc (default)
	ArrowDown10, // 1: G desc
	ArrowDown01, // 2: G asc
	ArrowDownZA, // 3: alpha desc
] as const;

function weekLabel(week: GameWeek) {
	const start = week.start_date
		? DateTime.fromISO(week.start_date).toFormat("MMM d")
		: "";
	const end = week.end_date
		? DateTime.fromISO(week.end_date).toFormat("MMM d")
		: "";
	return `Wk ${week.number}: ${start} – ${end}`;
}

export function ScheduleGrid() {
	const [weeks, setWeeks] = useState<GameWeek[]>([]);
	const [activeWeekIdx, setActiveWeekIdx] = useState(0);
	const [teams, setTeams] = useState<Team[]>([]);
	const [games, setGames] = useState<Game[]>([]);
	const [loading, setLoading] = useState(true);

	// Team column: 4-state cycle
	const [teamSortIdx, setTeamSortIdx] = useState(0);
	// Day column: independent sort (mutually exclusive with team cycle being "active")
	const [daySortCol, setDaySortCol] = useState<string | null>(null);
	const [daySortDir, setDaySortDir] = useState<"asc" | "desc">("desc");

	function handleTeamSort() {
		setTeamSortIdx((i) => (i + 1) % 4);
		setDaySortCol(null);
	}

	function handleDaySort(day: string) {
		if (daySortCol === day) {
			setDaySortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setDaySortCol(day);
			setDaySortDir("desc");
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

			const todayET = DateTime.now()
				.setZone("America/New_York")
				.toISODate();
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

		const startUTC = DateTime.fromISO(week.start_date, {
			zone: "America/New_York",
		})
			.startOf("day")
			.toUTC()
			.toISO();
		const endUTC = DateTime.fromISO(week.end_date, {
			zone: "America/New_York",
		})
			.endOf("day")
			.toUTC()
			.toISO();

		if (!startUTC || !endUTC) return;

		supabase
			.from("game")
			.select(
				`id, datetime, team_home_id, team_away_id, status_code, team_home_score, team_away_score,
				home_team:team!game_team_home_id_fkey(id, tricode, color_primary_hex),
				away_team:team!game_team_away_id_fkey(id, tricode, color_primary_hex)`,
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
		let current = DateTime.fromISO(week.start_date, {
			zone: "America/New_York",
		});
		const end = DateTime.fromISO(week.end_date, {
			zone: "America/New_York",
		});
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
				teamGameCounts[game.team_home_id] =
					(teamGameCounts[game.team_home_id] ?? 0) + 1;
			}
			if (game.team_away_id) {
				if (!cells[game.team_away_id]) cells[game.team_away_id] = {};
				cells[game.team_away_id][dateET] = game;
				teamGameCounts[game.team_away_id] =
					(teamGameCounts[game.team_away_id] ?? 0) + 1;
			}
		}

		return { cells, dayGameCounts, teamGameCounts };
	}, [games]);

	// Sorted teams
	const sortedTeams = useMemo(() => {
		const arr = [...teams];

		if (daySortCol) {
			const dir = daySortDir === "asc" ? 1 : -1;
			arr.sort((a, b) => {
				const hasA = cells[a.id]?.[daySortCol] ? 1 : 0;
				const hasB = cells[b.id]?.[daySortCol] ? 1 : 0;
				if (hasA !== hasB) return dir * (hasA - hasB);
				const gDiff =
					(teamGameCounts[a.id] ?? 0) - (teamGameCounts[b.id] ?? 0);
				if (gDiff !== 0) return dir * gDiff;
				return (a.tricode ?? "").localeCompare(b.tricode ?? "");
			});
		} else {
			switch (teamSortIdx % 4) {
				case 0: // alpha asc
					arr.sort((a, b) =>
						(a.tricode ?? "").localeCompare(b.tricode ?? ""),
					);
					break;
				case 1: // G desc
					arr.sort((a, b) => {
						const diff =
							(teamGameCounts[b.id] ?? 0) -
							(teamGameCounts[a.id] ?? 0);
						return diff !== 0
							? diff
							: (a.tricode ?? "").localeCompare(b.tricode ?? "");
					});
					break;
				case 2: // G asc
					arr.sort((a, b) => {
						const diff =
							(teamGameCounts[a.id] ?? 0) -
							(teamGameCounts[b.id] ?? 0);
						return diff !== 0
							? diff
							: (a.tricode ?? "").localeCompare(b.tricode ?? "");
					});
					break;
				case 3: // alpha desc
					arr.sort((a, b) =>
						(b.tricode ?? "").localeCompare(a.tricode ?? ""),
					);
					break;
			}
		}

		return arr;
	}, [teams, teamSortIdx, daySortCol, daySortDir, cells, teamGameCounts]);

	const todayET = DateTime.now().setZone("America/New_York").toISODate();
	const isCurrentWeek =
		week?.start_date &&
		week?.end_date &&
		todayET &&
		week.start_date <= todayET &&
		todayET <= week.end_date;

	const teamSortActive = daySortCol === null;
	const TeamSortIcon = TEAM_SORT_ICONS[teamSortIdx % 4];

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
						<SelectValue>
							{week ? weekLabel(week) : "Loading…"}
						</SelectValue>
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
					onClick={() =>
						setActiveWeekIdx((i) =>
							Math.min(weeks.length - 1, i + 1),
						)
					}
					disabled={activeWeekIdx >= weeks.length - 1}
					className="flex items-center justify-center size-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
				>
					<ChevronRight size={15} />
				</button>
			</div>

			{/* Grid */}
			<div className="overflow-x-auto rounded-md border border-border">
				<table
					className="w-full border-collapse text-sm"
					style={{ minWidth: 400 }}
				>
					<thead>
						<tr className="border-b border-border bg-muted/30">
							{/* Team + G header — sticky, single column */}
							<th className="sticky left-0 z-10 bg-muted border-r border-border">
								<button
									onClick={handleTeamSort}
									className={`w-full flex items-center gap-1 px-3 py-2.5 text-left text-xs uppercase tracking-wider font-medium cursor-pointer select-none transition-colors hover:text-foreground ${
										teamSortActive
											? "text-foreground"
											: "text-muted-foreground"
									}`}
								>
									Team
									<TeamSortIcon
										size={11}
										className={
											teamSortActive
												? "opacity-100"
												: "opacity-40"
										}
									/>
								</button>
							</th>

							{/* Day headers */}
							{days.map((day) => {
								const dt = DateTime.fromISO(day);
								const isToday = day === todayET;
								const count = dayGameCounts[day] ?? 0;
								const isDayActive = daySortCol === day;
								return (
									<th
										key={day}
										className={`border-r border-border last:border-r-0 ${
											isToday && isCurrentWeek
												? "bg-primary/8"
												: ""
										}`}
									>
										<button
											onClick={() => handleDaySort(day)}
											className={`w-full flex flex-col items-center px-2 py-2.5 min-w-[76px] text-xs uppercase tracking-wider font-medium cursor-pointer select-none transition-colors hover:text-foreground ${
												isToday &&
												isCurrentWeek &&
												!isDayActive
													? "text-foreground"
													: isDayActive
														? "text-foreground"
														: "text-muted-foreground"
											}`}
										>
											<span>{dt.toFormat("EEE")}</span>
											<span className="text-[10px] font-normal normal-case tracking-normal opacity-60">
												{dt.toFormat("M/d")}
											</span>
											{!loading && count > 0 && (
												<span className="mt-0.5 text-[10px] font-semibold normal-case tracking-normal opacity-50">
													{count}G
												</span>
											)}
											{isDayActive && (
												<ArrowDown
													size={10}
													className={`mt-0.5 transition-transform ${daySortDir === "asc" ? "rotate-180" : ""}`}
												/>
											)}
										</button>
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{loading
							? Array.from({ length: 15 }).map((_, i) => (
									<tr
										key={i}
										className="border-b border-border animate-pulse"
									>
										<td className="sticky left-0 z-10 bg-background px-3 py-2.5 border-r border-border">
											<div className="h-4 w-20 rounded bg-muted" />
										</td>
										{Array.from({
											length: days.length || 7,
										}).map((_, j) => (
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
									const gamesCount =
										teamGameCounts[team.id] ?? 0;
									const hasGame = gamesCount > 0;

									return (
										<tr
											key={team.id}
											className={`border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors ${
												!hasGame ? "opacity-40" : ""
											}`}
										>
											{/* Team + G — single sticky column */}
											<td className="sticky left-0 z-10 bg-background px-3 py-2 border-r border-border">
												<div className="flex items-center justify-between gap-3 w-20">
													<div className="flex items-center gap-1.5">
														<TeamLogo
															teamId={team.id}
															size={18}
														/>
														<span className="font-bold text-xs text-foreground tracking-wide">
															{team.tricode}
														</span>
													</div>
													{hasGame && (
														<span
															className={`text-xs font-semibold tabular-nums shrink-0 ${
																gamesCount >= 4
																	? "text-foreground"
																	: gamesCount >=
																		  3
																		? "text-foreground/70"
																		: "text-muted-foreground"
															}`}
														>
															{gamesCount}
														</span>
													)}
												</div>
											</td>

											{/* Game cells */}
											{days.map((day) => {
												const game = teamCells[day];
												const isToday = day === todayET;

												return (
													<td
														key={day}
														className={`px-1 py-2 text-center border-r border-border last:border-r-0 ${
															isToday &&
															isCurrentWeek
																? "bg-primary/5"
																: ""
														}`}
													>
														{game ? (
															<GameCell
																game={game}
																teamId={team.id}
															/>
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

function GameCell({ game, teamId }: { game: Game; teamId: string }) {
	const isHome = game.team_home_id === teamId;
	const oppTeam = isHome ? game.away_team : game.home_team;
	const prefix = isHome ? "vs" : "@";
	const isFinal = game.status_code === 3;

	const teamScore = isHome ? game.team_home_score : game.team_away_score;
	const oppScore = isHome ? game.team_away_score : game.team_home_score;
	const won =
		isFinal &&
		teamScore !== null &&
		oppScore !== null &&
		teamScore > oppScore;

	return (
		<div className="flex flex-col items-center gap-0.5">
			<div className="flex items-center gap-1">
				<span className="text-muted-foreground/50 text-[10px]">
					{prefix}
				</span>
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
