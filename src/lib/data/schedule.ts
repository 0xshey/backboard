/**
 * Schedule data access. Pages import from here, never from the JSON files
 * directly, so the backing store can change without touching pages.
 */
import { DateTime } from "luxon";
import type { ScheduledGame } from "@/lib/sources/types";
import { readDataFile, SEASON } from "./store";
import type { FantasyWeek } from "@/lib/sources/fantasy-weeks";

export type Team = {
	id: string;
	tricode: string;
	name: string;
	city: string;
	color_primary_hex: string | null;
};

export type { FantasyWeek } from "@/lib/sources/fantasy-weeks";

export type { ScheduledGame };

type ScheduleFile = {
	source: string;
	fetchedAt: string;
	season: string;
	games: ScheduledGame[];
};

const scheduleFile = () => readDataFile<ScheduleFile>(`schedule-${SEASON}.json`);

export function getTeams(): Team[] {
	return readDataFile<Team[]>("teams.json");
}

export function getWeeks(): FantasyWeek[] {
	return readDataFile<FantasyWeek[]>(`fantasy-weeks-${SEASON}.json`);
}

export function getGames(): ScheduledGame[] {
	return scheduleFile().games;
}

/** Games whose UTC tip time falls in [startISO, endISO). */
export function getGamesInRange(startISO: string, endISO: string): ScheduledGame[] {
	return getGames().filter((g) => g.datetime >= startISO && g.datetime < endISO);
}

/** Index of the week containing today (ET): first week pre-season, last week after. */
export function getCurrentWeekIdx(weeks: FantasyWeek[] = getWeeks()) {
	const today = DateTime.now().setZone("America/New_York").toISODate()!;
	if (!weeks.length || today < weeks[0].start_date) return 0;
	const idx = weeks.findIndex((w) => w.start_date <= today && today <= w.end_date);
	return idx >= 0 ? idx : weeks.length - 1;
}

export function getScheduleMeta() {
	const { source, fetchedAt, season } = scheduleFile();
	return { source, fetchedAt, season };
}
