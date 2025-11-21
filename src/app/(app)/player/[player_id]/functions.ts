import { supabaseClient } from "@/lib/supabase/client";

export async function getPlayer(player_id: string) {
	const { data, error } = await supabaseClient
		.from("player")
		.select(
			`
		*,
		team:player_team_id_fkey(id,tricode,name,city)
	`
		)
		.eq("id", player_id)
		.single();

	if (error) {
		console.error("Error fetching Player:", error.message);
		throw error;
	}

	return data;
}

export async function getPlayerGames(player_id: string) {
	const { data, error } = await supabaseClient
		.from("game_player")
		.select(
			`
			*,
			team:game_player_team_id_fkey(tricode,name,city),
			opp_team:game_player_team_opp_id_fkey(tricode,name,city),
			game:game_player_game_fkey(datetime)
			`
		)
		.eq("player_id", player_id)
		.order("game_id", { ascending: false });

	if (error) {
		console.error("Error fetching GamePlayers:", error.message);
		throw error;
	}

	return data;
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

export async function getTeamGames(teamId: string) {
	const { data, error } = await supabaseClient
		.from("game")
		.select(
			`
				*,
				home_team:game_team_home_id_fkey(id, tricode, name, city),
				away_team:game_team_away_id_fkey(id, tricode, name, city)
			`
		)
		.or(`team_home_id.eq.${teamId},team_away_id.eq.${teamId}`)
		.order("datetime", { ascending: true });

	if (error) {
		console.error("Error fetching Team Games:", error.message);
		throw error;
	}

	return data;
}
