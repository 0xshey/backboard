import type { ProbeCase } from "../probe";
import { espnUrls } from "./client";
import { RawInjuries, RawRoster, RawStatsByAthlete, RawSummary, RawTeamSchedule, RawTeams } from "./raw";

/** One cheap request per dataset. Event 401704627 is a completed 2024-25 game. */
export function espnProbeCases(season: number): ProbeCase[] {
	return [
		{ name: "teams", url: espnUrls.teams(), schema: RawTeams },
		{ name: "schedule", url: espnUrls.teamSchedule("7", season), schema: RawTeamSchedule },
		{ name: "roster", url: espnUrls.roster("1"), schema: RawRoster },
		{
			name: "season-stats",
			url: espnUrls.statsByAthlete(season - 1, 1, 5),
			schema: RawStatsByAthlete,
		},
		{ name: "injuries", url: espnUrls.injuries(), schema: RawInjuries },
		{ name: "boxscore", url: espnUrls.summary("401704627"), schema: RawSummary },
	];
}
