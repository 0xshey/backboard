/**
 * Zod schemas for cdn.nba.com static/live JSON. Akamai returns "Access Denied"
 * unless requests carry nba.com Origin/Referer headers (see client.ts). Its big
 * advantage over ESPN is that it uses NBA.com ids, which match our headshot and
 * logo URLs.
 */
import { z } from "zod";

// Unscheduled games (e.g. NBA Cup knockouts) have teamId 0 and null tricodes.
const RawCdnTeam = z.object({ teamId: z.number(), teamTricode: z.string().nullable() });

export const RawScheduleLeague = z.object({
	leagueSchedule: z.object({
		seasonYear: z.string(),
		gameDates: z.array(
			z.object({
				games: z.array(
					z.object({
						gameId: z.string(),
						gameDateTimeUTC: z.string(),
						homeTeam: RawCdnTeam,
						awayTeam: RawCdnTeam,
					}),
				),
			}),
		),
	}),
});

export const RawScoreboard = z.object({
	scoreboard: z.object({
		gameDate: z.string(),
		games: z.array(z.object({ gameId: z.string(), gameStatus: z.number() })),
	}),
});

const RawBoxPlayer = z.object({
	personId: z.number(),
	name: z.string(),
	statistics: z.object({
		minutes: z.string(),
		points: z.number(),
		reboundsTotal: z.number(),
		assists: z.number(),
		steals: z.number(),
		blocks: z.number(),
		turnovers: z.number(),
		threePointersMade: z.number(),
		fieldGoalsMade: z.number(),
		fieldGoalsAttempted: z.number(),
		freeThrowsMade: z.number(),
		freeThrowsAttempted: z.number(),
	}),
});

export const RawBoxscore = z.object({
	game: z.object({
		gameId: z.string(),
		homeTeam: RawCdnTeam.extend({ players: z.array(RawBoxPlayer) }),
		awayTeam: RawCdnTeam.extend({ players: z.array(RawBoxPlayer) }),
	}),
});

export type RawScheduleLeague = z.infer<typeof RawScheduleLeague>;
export type RawScoreboard = z.infer<typeof RawScoreboard>;
export type RawBoxscore = z.infer<typeof RawBoxscore>;
