import { createClient } from "@/lib/supabase/server";
import { computeProjectedFP, type ProjectionResult } from "@/lib/projected-fp";
import {
	fetchGamesForDate,
	fetchStandingsForTeams,
	type TeamStanding,
} from "@/app/(app)/rankings/functions";
import { ProjectedFPTable } from "@/components/projected-fp/projected-fp-table";

export interface GameSection {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	game: any;
	projections: ProjectionResult[];
	standings: Record<string, TeamStanding>;
}

export async function ProjectedFPContent({ date }: { date: string }) {
	const supabase = await createClient();

	// Wave 1 — all parallel, no dependencies on each other
	const [
		games,
		seasonGamesResult,
		fullDumpResult,
		consistencyResult,
		standingsAllResult,
	] = await Promise.all([
		fetchGamesForDate(date),
		// All season games for home/away lookup (no join needed)
		supabase.from("game").select("id, team_home_id"),
		// Lean game_player dump — used for OPP_DEF, HOME_AWAY splits, L5
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
	// If a game has no game_player rows (pipeline hasn't created them yet),
	// fall back to fetching active players via player.team_id.
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

				// Filter to players with a 2025-26 season average
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

	// League mean FP per player-game (denominator for OPP_DEF)
	const allFPs = fullDump
		.map((r) => r.fp)
		.filter((v): v is number => typeof v === "number");
	const leagueMeanFP =
		allFPs.length > 0
			? allFPs.reduce((s, v) => s + v, 0) / allFPs.length
			: 25;

	// Per-team opponent defense metrics
	const oppDefMetrics = new Map<string, { mean: number; count: number }>();
	for (const [teamId, fps] of oppFPMap.entries()) {
		oppDefMetrics.set(teamId, {
			mean: fps.reduce((s, v) => s + v, 0) / fps.length,
			count: fps.length,
		});
	}

	// Consistency index
	const consistencyMap = new Map(
		consistencyRows.map((c) => [c.player_id, c]),
	);

	// Standings for pace proxy
	const standingsMap = new Map(standingsAll.map((s) => [s.team_id, s]));
	const allPointsFor = standingsAll
		.map((s) => s.points_for)
		.filter((v): v is number => typeof v === "number" && v > 0);
	const leagueAvgPointsFor =
		allPointsFor.length > 0
			? allPointsFor.reduce((s, v) => s + v, 0) / allPointsFor.length
			: 115;

	// ── Compute projections, grouped by game ────────────────────────────────
	const gameSections: GameSection[] = [];

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

			// L5: last 5 entries (insertion order approximates recency)
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
			});

			projections.push(projection);
		}

		projections.sort((a, b) => b.projectedFP - a.projectedFP);

		if (projections.length > 0) {
			gameSections.push({ game, projections, standings: teamStandings });
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

	// Accuracy summary
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

	return (
		<ProjectedFPTable
			gameSections={gameSections}
			hasCompletedGames={hasCompletedGames}
			mae={mae}
			completedCount={completedProjections.length}
		/>
	);
}
