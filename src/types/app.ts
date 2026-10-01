import type { Database } from "./supabase";

type TeamRow = Database["public"]["Tables"]["team"]["Row"];
type PlayerRow = Database["public"]["Tables"]["player"]["Row"];
type GameRow = Database["public"]["Tables"]["game"]["Row"];
type GamePlayerRow = Database["public"]["Tables"]["game_player"]["Row"];
export type GameWeekRow = Database["public"]["Tables"]["game_week_fantasy"]["Row"];

export type TeamStanding = {
	record: string; // "32-18"
	confRank: string | null; // "W3" | "E14" | null
};

export type PlayerWithTeam = PlayerRow & { team: TeamRow | null };

export type GameLogFull = GamePlayerRow & {
	game: GameRow;
	team: TeamRow | null;
	opp_team: TeamRow | null;
};

export interface PlayerSearchResult {
	id: number;
	first_name: string;
	last_name: string;
	jersey_number: number | null;
	team: {
		id: number;
	} | null;
}
