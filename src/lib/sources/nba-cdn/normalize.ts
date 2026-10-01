import type { ScheduledGame } from "../types";
import type { RawScheduleLeague } from "./raw";

/**
 * Regular-season games only (NBA game ids "002…"; preseason is "001…"), skipping
 * placeholder games whose teams aren't decided yet (teamId 0).
 */
export function normalizeSchedule(raw: RawScheduleLeague): ScheduledGame[] {
	return raw.leagueSchedule.gameDates
		.flatMap((d) => d.games)
		.filter((g) => g.gameId.startsWith("002") && g.homeTeam.teamId && g.awayTeam.teamId)
		.map((g) => ({
			id: `nba:${g.gameId}`,
			datetime: new Date(g.gameDateTimeUTC).toISOString(),
			homeTeamId: String(g.homeTeam.teamId),
			awayTeamId: String(g.awayTeam.teamId),
			timeValid: true,
		}));
}
