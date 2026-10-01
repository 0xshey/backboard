/**
 * Zod schemas for sports.core.api.espn.com. This host is flaky (intermittent
 * timeouts), so it's isolated from the main ESPN tool and only used to enrich
 * player bios with draft data.
 */
import { z } from "zod";

export const RawCoreAthlete = z.object({
	id: z.string(),
	displayName: z.string(),
	age: z.number().optional(),
	dateOfBirth: z.string().optional(),
	debutYear: z.number().optional(),
	experience: z.object({ years: z.number() }).optional(),
	draft: z
		.object({
			year: z.number(),
			round: z.number(),
			selection: z.number(),
		})
		.optional(),
	position: z.object({ abbreviation: z.string() }).optional(),
});

export type RawCoreAthlete = z.infer<typeof RawCoreAthlete>;
