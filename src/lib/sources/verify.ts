import type { ScheduledGame } from "./types";

export type ScheduleDiff = {
	primaryCount: number;
	referenceCount: number;
	/** Same matchup and identical tip time. */
	exact: number;
	/** Same matchup, tip time differs by under 24h (usually a time change). */
	timeChanged: { primary: ScheduledGame; reference: ScheduledGame }[];
	/** Games with no counterpart in the other source. */
	primaryOnly: ScheduledGame[];
	referenceOnly: ScheduledGame[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Cross-check two schedules for the same season. Games are paired by matchup
 * (home + away team) and then by closest tip time, since sources use different
 * game ids.
 */
export function compareSchedules(primary: ScheduledGame[], reference: ScheduledGame[]): ScheduleDiff {
	const key = (g: ScheduledGame) => `${g.homeTeamId}|${g.awayTeamId}`;
	const pool = new Map<string, ScheduledGame[]>();
	for (const g of reference) pool.set(key(g), [...(pool.get(key(g)) ?? []), g]);

	const diff: ScheduleDiff = {
		primaryCount: primary.length,
		referenceCount: reference.length,
		exact: 0,
		timeChanged: [],
		primaryOnly: [],
		referenceOnly: [],
	};

	for (const g of primary) {
		const candidates = pool.get(key(g)) ?? [];
		const exactIdx = candidates.findIndex((c) => c.datetime === g.datetime);
		if (exactIdx >= 0) {
			diff.exact++;
			candidates.splice(exactIdx, 1);
			continue;
		}
		const nearIdx = candidates.findIndex(
			(c) => Math.abs(Date.parse(c.datetime) - Date.parse(g.datetime)) < DAY_MS,
		);
		if (nearIdx >= 0) {
			diff.timeChanged.push({ primary: g, reference: candidates[nearIdx] });
			candidates.splice(nearIdx, 1);
			continue;
		}
		diff.primaryOnly.push(g);
	}
	diff.referenceOnly = [...pool.values()].flat();
	return diff;
}

export function schedulesAgree(d: ScheduleDiff) {
	return d.timeChanged.length === 0 && d.primaryOnly.length === 0 && d.referenceOnly.length === 0;
}
