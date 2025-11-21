import { supabaseClient } from "@/lib/supabase/client";
import { Team, Game, GameWeekFantasy, FantasyProvider } from "@/types";

export async function getTeams() {
	const { data, error } = await supabaseClient
		.from("team")
		.select("*")
		.eq("nba", true);

	if (error) {
		console.error("Error fetching teams:", error.message);
		throw error;
	}

	return data as Team[];
}

export async function getFantasyGameWeeks() {
	const { data, error } = await supabaseClient
		.from("game_week_fantasy")
		.select("*");

	if (error) {
		console.error("Error fetching players:", error.message);
		throw error;
	}

	return data as GameWeekFantasy[];
}

export async function getGamesForFantasyWeek(
	week: number,
	provider: FantasyProvider
) {
	const { data, error } = await supabaseClient.rpc("get_games_for_week", {
		p_number: week,
		p_provider: provider,
	});

	if (error) {
		console.error("Error fetching games for week:", error.message);
		throw error;
	}

	return data;
}

// Derivation functions
export function deriveGamesByTeam(teams: Team[], games: Game[]) {
	const map: Record<string, Game[]> = {};

	teams.forEach((t) => {
		map[t.id] = games.filter(
			(g) => g.team_home_id === t.id || g.team_away_id === t.id
		);
	});

	return map;
}

export function deriveTeamsGroupedByGameCount(
	teams: Team[],
	gamesByTeam: Record<string, Game[]>
) {
	const countMap = new Map<number, Team[]>();

	teams.forEach((t) => {
		const count = (gamesByTeam[t.id] || []).length;
		if (!countMap.has(count)) countMap.set(count, []);
		countMap.get(count)!.push(t);
	});

	const groups = Array.from(countMap.entries())
		.map(([count, teamList]) => ({
			count,
			teams: teamList.sort((a, b) =>
				`${a.city} ${a.name}`.localeCompare(`${b.city} ${b.name}`)
			),
		}))
		.sort((a, b) => b.count - a.count);

	return groups;
}
