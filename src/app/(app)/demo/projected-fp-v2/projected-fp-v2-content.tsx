import { createClient } from "@/lib/supabase/server";
import {
	computeProjectedFP,
	type ProjectionResult,
	type InjuredTeammate,
} from "@/lib/projected-fp";
import {
	fetchGamesForDate,
	fetchStandingsForTeams,
	type TeamStanding,
} from "@/app/(app)/rankings/functions";
import { ProjectedFPV2Table } from "@/components/projected-fp/projected-fp-v2-table";

export interface InjuryReportRow {
	playerName: string;
	team: string;
	currentStatus: string;
	reason: string;
}

export interface TeamInjurySummary {
	teamId: string;
	outPlayers: InjuryReportRow[];
	displacedFP: number;
	activeTeamFP: number;
	injuredTeammates: InjuredTeammate[];
}

export interface GameSectionV2 {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	game: any;
	projections: ProjectionResult[];
	standings: Record<string, TeamStanding>;
	injurySummaries: Record<string, TeamInjurySummary>;
	/** playerId → injury status for players on this game's rosters */
	playerInjuryStatuses: Record<string, string>;
}

/** p_out: expected fraction of usage that is displaced */
const STATUS_P_OUT: Record<string, number> = {
	Out: 1.0,
	Doubtful: 0.8,
	Questionable: 0.4,
	Probable: 0.1,
	Available: 0.0,
	nan: 0.0,
};

/**
 * Normalize a player name for fuzzy matching.
 * Handles "Last, First" (injury report) and "First Last" (player table).
 * Strips suffixes like Jr., Sr., II, III, IV and punctuation.
 */
function normalizeName(name: string): string {
	const suffixRe = /\s+(jr\.?|sr\.?|ii|iii|iv|v)$/i;
	const clean = (s: string) =>
		s
			.replace(suffixRe, "")
			.toLowerCase()
			.replace(/[^a-z ]/g, "")
			.replace(/\s+/g, " ")
			.trim();

	const commaIdx = name.indexOf(",");
	if (commaIdx > -1) {
		// "Last, First" → "first last"
		const last = name.slice(0, commaIdx).trim();
		const first = name.slice(commaIdx + 1).trim();
		return clean(`${first} ${last}`);
	}
	return clean(name);
}

export async function ProjectedFPV2Content({
	date,
	absorptionRate,
}: {
	date: string;
	absorptionRate: number;
}) {
	const supabase = await createClient();

	// Format date for injury_report query (MM/DD/YYYY)
	const [year, month, day] = date.split("-");
	const injuryDateStr = `${month}/${day}/${year}`;

	// Wave 1 — all parallel
	const [
		games,
		seasonGamesResult,
		fullDumpResult,
		consistencyResult,
		standingsAllResult,
		injuryReportResult,
	] = await Promise.all([
		fetchGamesForDate(date),
		supabase.from("game").select("id, team_home_id"),
		supabase
			.from("game_player")
			.select("player_id, team_id, team_opp_id, fp, game_id")
			.eq("played", true),
		supabase
			.from("player_consistency")
			.select(
				"player_id, avg_fantasy_points_l10, variation_pct, games_played",
			),
		supabase
			.from("standings")
			.select("team_id, points_for, wins, losses"),
		// injury_report is not in generated types — cast to any
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(supabase as any)
			.from("injury_report")
			.select("player_name, team, current_status, reason")
			.eq("game_date", injuryDateStr),
	]);

	const gameIds = games.map((g) => g.id);

	if (gameIds.length === 0) {
		return (
			<p className="text-center text-muted-foreground text-sm py-20 italic">
				No games found for this date.
			</p>
		);
	}

	// Build a quick lookup: gameId → team_home_id
	const gameHomeMap = new Map<string, string>();
	for (const g of seasonGamesResult.data ?? []) {
		if (g.id && g.team_home_id) gameHomeMap.set(g.id, g.team_home_id);
	}

	// Wave 2 — depends on gameIds
	const teamIds = [
		...new Set(
			games
				.flatMap((g) => [
					(g as any).home_team?.id,
					(g as any).away_team?.id,
				])
				.filter(Boolean),
		),
	] as string[];

	const [targetPlayersResult, teamStandings] = await Promise.all([
		supabase
			.from("game_player")
			.select(
				`player_id, team_id, team_opp_id, game_id, fp, played,
				game:game_id(id, status_code, team_home_id),
				player:player_id(id, first_name, last_name, season_averages:player_season_averages(*)),
				team:team!game_player_team_fkey(id, name, tricode)`,
			)
			.in("game_id", gameIds)
			.eq("player.season_averages.season", "2025-26"),
		fetchStandingsForTeams(teamIds),
	]);

	const fullDump = fullDumpResult.data ?? [];
	const consistencyRows = consistencyResult.data ?? [];
	const standingsAll = standingsAllResult.data ?? [];
	let targetPlayers = (targetPlayersResult.data ?? []) as any[];

	// ── Roster fallback for upcoming games ──────────────────────────────────
	const gameIdsWithRows = new Set(targetPlayers.map((gp) => gp.game_id));
	const gamesNeedingRosters = games.filter(
		(g) => !gameIdsWithRows.has(g.id),
	);

	if (gamesNeedingRosters.length > 0) {
		const rosterTeamIds = [
			...new Set(
				gamesNeedingRosters
					.flatMap((g) => [
						(g as any).team_home_id,
						(g as any).team_away_id,
					])
					.filter(Boolean),
			),
		] as string[];

		const { data: rosterPlayers } = await supabase
			.from("player")
			.select(
				"id, first_name, last_name, team_id, season_averages:player_season_averages(*)",
			)
			.in("team_id", rosterTeamIds);

		for (const game of gamesNeedingRosters) {
			const homeId = (game as any).team_home_id as string | null;
			const awayId = (game as any).team_away_id as string | null;

			for (const p of rosterPlayers ?? []) {
				if (p.team_id !== homeId && p.team_id !== awayId) continue;

				const seasonAvgs = Array.isArray(p.season_averages)
					? p.season_averages
					: p.season_averages
						? [p.season_averages]
						: [];
				const hasCurrent = seasonAvgs.some(
					(sa: any) => sa.season === "2025-26",
				);
				if (!hasCurrent) continue;

				const oppId = p.team_id === homeId ? awayId : homeId;
				targetPlayers.push({
					player_id: p.id,
					team_id: p.team_id,
					team_opp_id: oppId,
					game_id: (game as any).id,
					fp: null,
					played: false,
					game: {
						id: (game as any).id,
						status_code: (game as any).status_code,
						team_home_id: homeId,
					},
					player: p,
					team: null,
				});
			}
		}
	}

	// ── Build indexes from the full-season dump ──────────────────────────────
	type HistoryEntry = { fp: number; isHome: boolean };
	const playerHistory = new Map<string, HistoryEntry[]>();
	const oppFPMap = new Map<string, number[]>();

	for (const row of fullDump) {
		if (typeof row.fp !== "number") continue;
		const isHome = gameHomeMap.get(row.game_id) === row.team_id;

		if (row.player_id) {
			if (!playerHistory.has(row.player_id))
				playerHistory.set(row.player_id, []);
			playerHistory.get(row.player_id)!.push({ fp: row.fp, isHome });
		}

		if (row.team_opp_id) {
			if (!oppFPMap.has(row.team_opp_id))
				oppFPMap.set(row.team_opp_id, []);
			oppFPMap.get(row.team_opp_id)!.push(row.fp);
		}
	}

	const allFPs = fullDump
		.map((r) => r.fp)
		.filter((v): v is number => typeof v === "number");
	const leagueMeanFP =
		allFPs.length > 0
			? allFPs.reduce((s, v) => s + v, 0) / allFPs.length
			: 25;

	const oppDefMetrics = new Map<string, { mean: number; count: number }>();
	for (const [teamId, fps] of oppFPMap.entries()) {
		oppDefMetrics.set(teamId, {
			mean: fps.reduce((s, v) => s + v, 0) / fps.length,
			count: fps.length,
		});
	}

	const consistencyMap = new Map(
		consistencyRows.map((c) => [c.player_id, c]),
	);

	const standingsMap = new Map(standingsAll.map((s) => [s.team_id, s]));
	const allPointsFor = standingsAll
		.map((s) => s.points_for)
		.filter((v): v is number => typeof v === "number" && v > 0);
	const leagueAvgPointsFor =
		allPointsFor.length > 0
			? allPointsFor.reduce((s, v) => s + v, 0) / allPointsFor.length
			: 115;

	// ── Build injury context ─────────────────────────────────────────────────
	// Map: normalized player name → { player_id, team_id, seasonAvgFP }
	const playerNameMap = new Map<
		string,
		{ playerId: string; teamId: string; seasonAvgFP: number }
	>();

	for (const gp of targetPlayers) {
		const player = gp.player as any;
		if (!player) continue;
		const seasonAvgs = Array.isArray(player.season_averages)
			? player.season_averages
			: player.season_averages
				? [player.season_averages]
				: [];
		const seasonAvg = seasonAvgs.find((sa: any) => sa.season === "2025-26");
		const seasonAvgFP: number | null = seasonAvg?.nba_fantasy_points ?? null;
		if (!seasonAvgFP || seasonAvgFP <= 0) continue;

		const key = normalizeName(
			`${player.first_name} ${player.last_name}`,
		);
		playerNameMap.set(key, {
			playerId: gp.player_id,
			teamId: gp.team_id,
			seasonAvgFP,
		});
	}

	// Build per-team injury data: teamId → list of injured teammates
	const teamInjuryMap = new Map<
		string,
		Array<{ name: string; status: string; seasonAvgFP: number; pOut: number }>
	>();
	/** playerId → injury status (all statuses, not just Out) */
	const playerInjuryStatusMap = new Map<string, string>();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const injuryRows: Array<{
		player_name: string;
		team: string;
		current_status: string;
		reason: string;
	}> = (injuryReportResult as any).data ?? [];
	for (const row of injuryRows) {
		const normalizedName = normalizeName(row.player_name);
		const match = playerNameMap.get(normalizedName);
		if (!match) continue;

		// Track every player's status for display purposes
		playerInjuryStatusMap.set(match.playerId, row.current_status);

		const pOut = STATUS_P_OUT[row.current_status] ?? 0;
		if (pOut === 0) continue; // Available → no meaningful boost

		if (!teamInjuryMap.has(match.teamId))
			teamInjuryMap.set(match.teamId, []);
		teamInjuryMap.get(match.teamId)!.push({
			name: row.player_name,
			status: row.current_status,
			seasonAvgFP: match.seasonAvgFP,
			pOut,
		});
	}

	// Compute per-team displaced FP and active team FP
	// activeTeamFP = total team season avg FP minus weighted displaced FP
	const teamTotalFP = new Map<string, number>();
	for (const gp of targetPlayers) {
		const player = gp.player as any;
		if (!player) continue;
		const seasonAvgs = Array.isArray(player.season_averages)
			? player.season_averages
			: player.season_averages
				? [player.season_averages]
				: [];
		const seasonAvg = seasonAvgs.find((sa: any) => sa.season === "2025-26");
		const fp: number | null = seasonAvg?.nba_fantasy_points ?? null;
		if (!fp || fp <= 0) continue;
		teamTotalFP.set(
			gp.team_id,
			(teamTotalFP.get(gp.team_id) ?? 0) + fp,
		);
	}

	// Per-team summary used by the table
	const injurySummaries = new Map<string, TeamInjurySummary>();
	for (const game of games) {
		const teamIds = [
			(game as any).home_team?.id,
			(game as any).away_team?.id,
		].filter(Boolean) as string[];

		for (const teamId of teamIds) {
			const injured = teamInjuryMap.get(teamId) ?? [];
			const totalFP = teamTotalFP.get(teamId) ?? 0;
			const displacedFP = injured.reduce(
				(s, p) => s + p.seasonAvgFP * p.pOut,
				0,
			);
			const activeTeamFP = Math.max(totalFP - displacedFP, 1);

			const injuredTeammates: InjuredTeammate[] = injured.map((p) => ({
				name: p.name,
				status: p.status,
				seasonAvgFP: p.seasonAvgFP,
				pOut: p.pOut,
			}));

			const outOnly = injuryRows
				.filter((r) => {
					const normalizedName = normalizeName(r.player_name);
					const match = playerNameMap.get(normalizedName);
					return match?.teamId === teamId;
				})
				.map((r) => ({
					playerName: r.player_name,
					team: r.team,
					currentStatus: r.current_status,
					reason: r.reason,
				}));

			injurySummaries.set(teamId, {
				teamId,
				outPlayers: outOnly,
				displacedFP,
				activeTeamFP,
				injuredTeammates,
			});
		}
	}

	// ── Compute projections, grouped by game ────────────────────────────────
	const gameSections: GameSectionV2[] = [];

	for (const game of games) {
		const gamePlayers = targetPlayers.filter(
			(gp) => gp.game_id === game.id,
		);

		const projections: ProjectionResult[] = [];

		for (const gp of gamePlayers) {
			const player = gp.player as any;
			if (!player) continue;

			const seasonAvg = Array.isArray(player.season_averages)
				? player.season_averages.find(
						(sa: any) => sa.season === "2025-26",
					)
				: player.season_averages;

			const seasonAvgFP: number | null = seasonAvg?.nba_fantasy_points ?? null;
			if (!seasonAvgFP || seasonAvgFP <= 0) continue;

			const cons = consistencyMap.get(gp.player_id) as any;
			const history = playerHistory.get(gp.player_id) ?? [];

			const l5GameFPs = history.slice(-5).map((h) => h.fp);
			const homeGameFPs = history.filter((h) => h.isHome).map((h) => h.fp);
			const awayGameFPs = history
				.filter((h) => !h.isHome)
				.map((h) => h.fp);

			const gameRow = gp.game as any;
			const isHome = gameRow?.team_home_id === gp.team_id;

			const oppDef = oppDefMetrics.get(gp.team_opp_id ?? "") ?? {
				mean: leagueMeanFP,
				count: 0,
			};
			const oppStandings = standingsMap.get(gp.team_opp_id ?? "") as any;

			// Injury context for this player's team
			const injuryCtx = injurySummaries.get(gp.team_id);

			const projection = computeProjectedFP({
				playerId: gp.player_id ?? "",
				firstName: player.first_name ?? "",
				lastName: player.last_name ?? "",
				teamId: gp.team_id ?? "",
				gameId: gp.game_id ?? "",
				seasonAvgFP,
				gamesPlayed: seasonAvg?.games_played ?? 0,
				variationPct: cons?.variation_pct ?? null,
				l10AvgFP: cons?.avg_fantasy_points_l10 ?? null,
				l5GameFPs,
				homeGameFPs,
				awayGameFPs,
				isHome,
				oppMeanFPAllowed: oppDef.mean,
				leagueMeanFPAllowed: leagueMeanFP,
				oppGamesCount: oppDef.count,
				oppPointsFor:
					oppStandings?.points_for ?? leagueAvgPointsFor,
				leagueAvgPointsFor,
				actualFP:
					gp.played && gp.fp != null ? (gp.fp as number) : null,
				played: gp.played ?? false,
				// Injury boost inputs
				displacedFP: injuryCtx?.displacedFP ?? 0,
				activeTeamFP: injuryCtx?.activeTeamFP ?? seasonAvgFP,
				injuredTeammates: injuryCtx?.injuredTeammates ?? [],
				absorptionRate,
			});

			projections.push(projection);
		}

		// Out players go to the bottom; active players sorted by projectedFP desc
		projections.sort((a, b) => {
			const aOut = playerInjuryStatusMap.get(a.playerId) === "Out";
			const bOut = playerInjuryStatusMap.get(b.playerId) === "Out";
			if (aOut !== bOut) return aOut ? 1 : -1;
			return b.projectedFP - a.projectedFP;
		});

		if (projections.length > 0) {
			const homeTeamId = (game as any).home_team?.id as string | undefined;
			const awayTeamId = (game as any).away_team?.id as string | undefined;

			const gameInjurySummaries: Record<string, TeamInjurySummary> = {};
			if (homeTeamId && injurySummaries.has(homeTeamId))
				gameInjurySummaries[homeTeamId] =
					injurySummaries.get(homeTeamId)!;
			if (awayTeamId && injurySummaries.has(awayTeamId))
				gameInjurySummaries[awayTeamId] =
					injurySummaries.get(awayTeamId)!;

			// Only include statuses for players in this game
			const gamePlayerIds = new Set(projections.map((p) => p.playerId));
			const playerInjuryStatuses: Record<string, string> = {};
			for (const [pid, status] of playerInjuryStatusMap) {
				if (gamePlayerIds.has(pid)) playerInjuryStatuses[pid] = status;
			}

			gameSections.push({
				game,
				projections,
				standings: teamStandings,
				injurySummaries: gameInjurySummaries,
				playerInjuryStatuses,
			});
		}
	}

	if (gameSections.length === 0) {
		return (
			<p className="text-center text-muted-foreground text-sm py-20 italic">
				No player projection data available for this date.
			</p>
		);
	}

	const hasCompletedGames = games.some((g) => (g as any).status_code === 3);

	const completedProjections = gameSections
		.flatMap((s) => s.projections)
		.filter((p) => p.error !== null);
	const mae =
		completedProjections.length > 0
			? completedProjections.reduce(
					(s, p) => s + Math.abs(p.error!),
					0,
				) / completedProjections.length
			: null;

	const injuryCount = [...injurySummaries.values()].reduce(
		(s, v) => s + v.injuredTeammates.length,
		0,
	);

	return (
		<ProjectedFPV2Table
			gameSections={gameSections}
			hasCompletedGames={hasCompletedGames}
			mae={mae}
			completedCount={completedProjections.length}
			absorptionRate={absorptionRate}
			injuryCount={injuryCount}
		/>
	);
}
