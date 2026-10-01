import type { PlayerBio, PlayerSeasonStats } from "@/lib/sources/types";
import { readDataFile, SEASON } from "./store";

export type PlayerRecord = PlayerBio & {
	isRookie: boolean;
	stats: PlayerSeasonStats | null;
};

type PlayersFile = {
	source: string;
	fetchedAt: string;
	season: string;
	statsSeason: string;
	players: PlayerRecord[];
};

const playersFile = () => readDataFile<PlayersFile>(`players-${SEASON}.json`);

export function getPlayers(): PlayerRecord[] {
	return playersFile().players;
}

export function getPlayersMeta() {
	const { source, fetchedAt, season, statsSeason } = playersFile();
	return { source, fetchedAt, season, statsSeason };
}
