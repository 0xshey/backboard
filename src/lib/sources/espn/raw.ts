/**
 * Zod schemas for the ESPN payloads Backboard uses (site.web.api.espn.com only —
 * the site.api.espn.com host is edge-blocked). Only fields we read are declared;
 * unknown fields are stripped.
 */
import { z } from "zod";

const RawTeamRef = z.object({
	id: z.string(),
	abbreviation: z.string(),
});

export const RawTeams = z.object({
	sports: z
		.array(
			z.object({
				leagues: z
					.array(
						z.object({
							teams: z.array(
								z.object({
									team: RawTeamRef.extend({
										displayName: z.string(),
										color: z.string().optional(),
									}),
								}),
							),
						}),
					)
					.min(1),
			}),
		)
		.min(1),
});

export const RawTeamSchedule = z.object({
	team: RawTeamRef,
	events: z.array(
		z.object({
			id: z.string(),
			date: z.string(),
			timeValid: z.boolean().optional(),
			seasonType: z.object({ type: z.number() }),
			competitions: z
				.array(
					z.object({
						competitors: z
							.array(
								z.object({
									homeAway: z.enum(["home", "away"]),
									team: RawTeamRef,
								}),
							)
							.length(2),
					}),
				)
				.min(1),
		}),
	),
});

const RawPosition = z.object({ abbreviation: z.string() }).nullish();

export const RawRoster = z.object({
	team: RawTeamRef,
	athletes: z.array(
		z.object({
			id: z.string(),
			displayName: z.string(),
			age: z.number().optional(),
			dateOfBirth: z.string().optional(),
			experience: z.object({ years: z.number() }).optional(),
			position: RawPosition,
			headshot: z.object({ href: z.string() }).optional(),
		}),
	),
});

const RawStatCategory = z.object({
	name: z.string(),
	names: z.array(z.string()),
});

/** Before a season's first game ESPN returns only `currentSeason` (no stats keys). */
export const RawStatsByAthlete = z.object({
	pagination: z.object({ count: z.number(), page: z.number(), pages: z.number() }).optional(),
	categories: z.array(RawStatCategory).default([]),
	athletes: z.array(
		z.object({
			athlete: z.object({
				id: z.string(),
				displayName: z.string(),
				teamShortName: z.string().optional(),
			}),
			categories: z.array(z.object({ name: z.string(), values: z.array(z.number().nullable()) })),
		}),
	).default([]),
});

export const RawInjuries = z.object({
	injuries: z.array(
		z.object({
			id: z.string(),
			displayName: z.string(),
			injuries: z.array(
				z.object({
					status: z.string(),
					date: z.string(),
					shortComment: z.string().optional(),
					athlete: z.object({
						displayName: z.string(),
						links: z.array(z.object({ href: z.string() })).optional(),
					}),
				}),
			),
		}),
	),
});

export const RawSummary = z.object({
	boxscore: z.object({
		players: z
			.array(
				z.object({
					team: RawTeamRef,
					statistics: z.array(
						z.object({
							names: z.array(z.string()).optional(),
							keys: z.array(z.string()).optional(),
							athletes: z.array(
								z.object({
									athlete: z.object({ id: z.string(), displayName: z.string() }),
									stats: z.array(z.string()),
								}),
							),
						}),
					),
				}),
			)
			.optional(),
	}),
});

export type RawTeams = z.infer<typeof RawTeams>;
export type RawTeamSchedule = z.infer<typeof RawTeamSchedule>;
export type RawRoster = z.infer<typeof RawRoster>;
export type RawStatsByAthlete = z.infer<typeof RawStatsByAthlete>;
export type RawInjuries = z.infer<typeof RawInjuries>;
export type RawSummary = z.infer<typeof RawSummary>;
