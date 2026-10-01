/**
 * Derives fantasy scoring weeks from a game schedule. Yahoo doesn't publish its
 * NBA weeks without an OAuth app, so we reproduce its rules (verified against
 * Yahoo's real 2025-26 weeks, stored in Supabase `game_week_fantasy`):
 *
 * 1. Weeks run Monday–Sunday in US Eastern time.
 * 2. Week 1 starts on opening night and ends that Sunday ("Short week").
 * 3. The All-Star break is folded into one extended week: every Monday week the
 *    break touches is merged ("Extended week").
 * 4. The last week ends on the final day of the regular season.
 */
import { DateTime } from "luxon";
import type { ScheduledGame } from "./types";

export type FantasyWeek = {
	number: number;
	label: string;
	start_date: string;
	end_date: string;
	notes: string | null;
};

const ZONE = "America/New_York";

function etDate(iso: string) {
	return DateTime.fromISO(iso, { zone: "utc" }).setZone(ZONE).startOf("day");
}

/**
 * The All-Star break: the longest run of 3+ consecutive days without games in
 * February. The NBA Cup knockout gap in December is ignored because those games
 * are placeholders, not a real break.
 */
export function findAllStarBreak(gameDates: Set<string>, first: DateTime, last: DateTime) {
	let best: { start: DateTime; end: DateTime } | null = null;
	let runStart: DateTime | null = null;
	for (let d = first; d <= last.plus({ days: 1 }); d = d.plus({ days: 1 })) {
		const idle = d <= last && !gameDates.has(d.toISODate()!);
		if (idle && d.month === 2) {
			runStart ??= d;
		} else if (runStart) {
			const end = d.minus({ days: 1 });
			const len = end.diff(runStart, "days").days + 1;
			const bestLen = best ? best.end.diff(best.start, "days").days + 1 : 0;
			if (len >= 3 && len > bestLen) best = { start: runStart, end };
			runStart = null;
		}
	}
	return best;
}

export function buildYahooWeeks(games: Pick<ScheduledGame, "datetime">[]): FantasyWeek[] {
	if (!games.length) return [];
	const dates = games.map((g) => etDate(g.datetime)).sort((a, b) => a.toMillis() - b.toMillis());
	const first = dates[0];
	const last = dates[dates.length - 1];
	const gameDates = new Set(dates.map((d) => d.toISODate()!));

	// 1–2, 4: Monday weeks clipped to the first and last game day.
	let weeks: { start: DateTime; end: DateTime; notes: string | null }[] = [];
	for (let monday = first.startOf("week"); monday <= last; monday = monday.plus({ weeks: 1 })) {
		const start = monday < first ? first : monday;
		const sunday = monday.plus({ days: 6 });
		weeks.push({
			start,
			end: sunday > last ? last : sunday,
			notes: start > monday ? "Short week" : null,
		});
	}

	// 3: merge the weeks the All-Star break touches.
	const brk = findAllStarBreak(gameDates, first, last);
	if (brk) {
		const touched = weeks.filter((w) => w.end >= brk.start && w.start <= brk.end);
		if (touched.length > 1) {
			const merged = { start: touched[0].start, end: touched[touched.length - 1].end, notes: "Extended week" };
			weeks = [...weeks.filter((w) => w.end < merged.start), merged, ...weeks.filter((w) => w.start > merged.end)];
		}
	}

	return weeks.map((w, i) => ({
		number: i + 1,
		label: `Week ${i + 1}`,
		start_date: w.start.toISODate()!,
		end_date: w.end.toISODate()!,
		notes: w.notes,
	}));
}
