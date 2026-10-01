/**
 * ESPN endpoint builders + typed fetchers. Every fetcher validates the payload
 * against raw.ts, so schema drift throws here instead of producing bad data.
 */
import { fetchJson } from "../http";
import {
	RawInjuries,
	RawRoster,
	RawStatsByAthlete,
	RawSummary,
	RawTeamSchedule,
	RawTeams,
} from "./raw";

const SITE = "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba";
const COMMON = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba";

/** ESPN seasons are named by their ending year: 2027 = 2026-27. */
export type EspnSeason = number;
export const REGULAR_SEASON = 2;

export const espnUrls = {
	teams: () => `${SITE}/teams`,
	teamSchedule: (espnTeamId: string, season: EspnSeason) =>
		`${SITE}/teams/${espnTeamId}/schedule?season=${season}&seasontype=${REGULAR_SEASON}`,
	roster: (espnTeamId: string) => `${SITE}/teams/${espnTeamId}/roster`,
	statsByAthlete: (season: EspnSeason, page = 1, limit = 1000) =>
		`${COMMON}/statistics/byathlete?season=${season}&seasontype=${REGULAR_SEASON}&limit=${limit}&page=${page}`,
	injuries: () => `${SITE}/injuries`,
	summary: (eventId: string) => `${SITE}/summary?event=${eventId}`,
};

export async function fetchTeams() {
	return RawTeams.parse((await fetchJson(espnUrls.teams())).data);
}

export async function fetchTeamSchedule(espnTeamId: string, season: EspnSeason) {
	return RawTeamSchedule.parse((await fetchJson(espnUrls.teamSchedule(espnTeamId, season))).data);
}

export async function fetchRoster(espnTeamId: string) {
	return RawRoster.parse((await fetchJson(espnUrls.roster(espnTeamId))).data);
}

/** All pages of season averages. */
export async function fetchStatsByAthlete(season: EspnSeason) {
	const first = RawStatsByAthlete.parse(
		(await fetchJson(espnUrls.statsByAthlete(season), { timeoutMs: 60_000 })).data,
	);
	const pages = [first];
	for (let page = 2; page <= (first.pagination?.pages ?? 1); page++) {
		pages.push(
			RawStatsByAthlete.parse(
				(await fetchJson(espnUrls.statsByAthlete(season, page), { timeoutMs: 60_000 })).data,
			),
		);
	}
	return pages;
}

export async function fetchInjuries() {
	return RawInjuries.parse((await fetchJson(espnUrls.injuries())).data);
}

export async function fetchSummary(eventId: string) {
	return RawSummary.parse((await fetchJson(espnUrls.summary(eventId))).data);
}
