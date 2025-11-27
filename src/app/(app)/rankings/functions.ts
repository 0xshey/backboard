import { DateTime } from "luxon";
import { createClient } from "@/lib/supabase/server";

/**
 * Fetch games that fall on a given date in a specific timezone.
 */
export async function fetchGamesForDate(
	gameDateString: string,
	timeZone = "America/New_York"
) {
	const supabase = await createClient();
	const startOfDay = DateTime.fromISO(gameDateString, {
		zone: timeZone,
	}).startOf("day");
	const endOfDay = DateTime.fromISO(gameDateString, { zone: timeZone }).endOf(
		"day"
	);

	const startISO = startOfDay.toISO();
	const endISO = endOfDay.toISO();

	const { data: games, error } = await supabase
		.from("game")
		.select(
			`
			*,
			home_team:team_home_id (*),
			away_team:team_away_id (*)
		`
		)
		.gte("datetime", startISO)
		.lte("datetime", endISO);

	if (error) throw error;
	return games ?? [];
}

/**
 * Fetch game_player rows (including related game, player, team) for the provided game IDs.
 */
export async function fetchGamePlayersForGameIds(gameIds: string[]) {
	const supabase = await createClient();
	if (!gameIds || gameIds.length === 0) return [];

	const { data, error } = await supabase
		.from("game_player")
		.select(
			`
			*,
			game:game_id (*),
			player:player_id (*),
			team:team!game_player_team_fkey (*)
		`
		)
		.in("game_id", gameIds);

	if (error) throw error;
	return data ?? [];
}

/**
 * Convenience: fetch games for a date and then fetch their game_players.
 * Returns { games, gamePlayers }.
 */
export async function fetchGamePlayersForDate(
	gameDateString: string,
	timeZone = "America/New_York"
) {
	const games = await fetchGamesForDate(gameDateString, timeZone);
	const gameIds = games.map((g: any) => g.id);
	const gamePlayers = await fetchGamePlayersForGameIds(gameIds);
	return { games, gamePlayers };
}

/*
Example usage:
const { games, gamePlayers } = await fetchGamePlayersForDate("2025-10-21");
or
const games = await fetchGamesForDate("2025-10-21");
const gamePlayers = await fetchGamePlayersForGameIds(["game-id-1", "game-id-2"]);
*/
