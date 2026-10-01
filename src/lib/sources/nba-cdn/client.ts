import { fetchJson } from "../http";
import { RawBoxscore, RawScheduleLeague, RawScoreboard } from "./raw";

const CDN = "https://cdn.nba.com/static/json";
const HEADERS = { Origin: "https://www.nba.com", Referer: "https://www.nba.com/" };

export const nbaCdnUrls = {
	schedule: () => `${CDN}/staticData/scheduleLeagueV2.json`,
	scoreboard: () => `${CDN}/liveData/scoreboard/todaysScoreboard_00.json`,
	boxscore: (gameId: string) => `${CDN}/liveData/boxscore/boxscore_${gameId}.json`,
};

export const nbaCdnHeaders = HEADERS;

export async function fetchSchedule() {
	return RawScheduleLeague.parse((await fetchJson(nbaCdnUrls.schedule(), { headers: HEADERS })).data);
}

export async function fetchScoreboard() {
	return RawScoreboard.parse((await fetchJson(nbaCdnUrls.scoreboard(), { headers: HEADERS })).data);
}

export async function fetchBoxscore(gameId: string) {
	return RawBoxscore.parse((await fetchJson(nbaCdnUrls.boxscore(gameId), { headers: HEADERS })).data);
}
