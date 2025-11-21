import { Database } from "./supabase";

export type FantasyProvider = Database["public"]["Enums"]["fantasy_provider"];

export type Player = Database["public"]["Tables"]["player"]["Row"];
export type Game = Database["public"]["Tables"]["game"]["Row"];
export type Team = Database["public"]["Tables"]["team"]["Row"];
export type GamePlayer = Database["public"]["Tables"]["game_player"]["Row"];
export type GameTeam = Database["public"]["Tables"]["game_team"]["Row"];
export type GameWeekFantasy =
	Database["public"]["Tables"]["game_week_fantasy"]["Row"];

export type PlayerSeasonTotals =
	Database["public"]["Tables"]["player_season_totals"]["Row"];

export type FantasyTeam =
	Database["public"]["Tables"]["fantasy_team_unlinked"]["Row"];

export type PlayerWithGames = Player & {
	games: GamePlayer[];
};

export type PlayerWithSeasonTotals = Player & {
	season_totals: PlayerSeasonTotals;
};

export type TeamGame = Game & {
	home_team: Team;
	away_team: Team;
};
