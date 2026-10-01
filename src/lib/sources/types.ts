/**
 * Canonical data shapes. Every source's normalize.ts maps its raw payloads into
 * these; nothing outside src/lib/sources/<source>/ should touch raw JSON.
 */

/** NBA.com team id, e.g. "1610612743" (matches src/data/teams.json and cdn.nba.com logos). */
export type NbaTeamId = string;

export type Tricode = string;

export type ScheduledGame = {
	/** Source-prefixed id, e.g. "espn:401909094" or "nba:0022600001". */
	id: string;
	/** ISO 8601 UTC tip time. */
	datetime: string;
	homeTeamId: NbaTeamId;
	awayTeamId: NbaTeamId;
	/** False when the source hasn't fixed a tip time yet (date only). */
	timeValid: boolean;
};

export type Position = "G" | "F" | "C" | "G-F" | "F-C" | string;

export type PlayerBio = {
	/** Source-prefixed id, e.g. "espn:3112335". */
	id: string;
	espnId: string | null;
	nbaId: string | null;
	name: string;
	teamId: NbaTeamId | null;
	position: Position | null;
	dateOfBirth: string | null;
	age: number | null;
	/** Seasons of NBA experience; 0 means rookie. */
	experience: number | null;
	draftYear: number | null;
	draftRound: number | null;
	draftPick: number | null;
	headshotUrl: string | null;
};

/** Per-game averages for one season. Percentages are 0–1. */
export type PlayerSeasonStats = {
	playerId: string;
	season: string; // "2025-26"
	gp: number;
	min: number;
	pts: number;
	reb: number;
	ast: number;
	stl: number;
	blk: number;
	tov: number;
	fgm: number;
	fga: number;
	fg3m: number;
	fg3a: number;
	ftm: number;
	fta: number;
	fgPct: number;
	ftPct: number;
	fg3Pct: number;
};

export type InjuryStatus = "Out" | "Day-To-Day" | "Questionable" | "Doubtful" | "Probable" | string;

export type InjuryItem = {
	playerId: string;
	playerName: string;
	teamId: NbaTeamId | null;
	status: InjuryStatus;
	date: string;
	comment: string | null;
};
