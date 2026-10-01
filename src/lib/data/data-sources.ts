/**
 * Where each page's data comes from, shown in the page's (i) disclaimer.
 * Keep in sync with src/lib/data/* and scripts/sources.ts.
 */
export type DataSource = {
	label: string;
	detail: string;
};

export const SOURCES = {
	nbaSchedule: { label: "NBA.com", detail: "2026-27 regular-season schedule (cdn.nba.com)" },
	espnScheduleCheck: { label: "ESPN", detail: "Independent cross-check of every game and tip time" },
	espnSchedule: { label: "ESPN", detail: "2026-27 regular-season schedule" },
	nbaScheduleCheck: { label: "NBA.com", detail: "Cross-check of every game and tip time, when reachable" },
	yahooWeeks: { label: "Backboard", detail: "Yahoo fantasy week windows, derived from the schedule" },
	espnRosters: { label: "ESPN", detail: "Current rosters, positions and ages" },
	espnStats: { label: "ESPN", detail: "Last season's per-game averages" },
	espnDraft: { label: "ESPN", detail: "Draft year, round and pick" },
	nbaImages: { label: "NBA.com", detail: "Player headshots and team logos" },
	espnImages: { label: "ESPN", detail: "Headshots for players without an NBA.com match (mostly rookies)" },
} satisfies Record<string, DataSource>;

export const DISCLAIMER =
	"Backboard is an unofficial fan project, not affiliated with the NBA, ESPN or Yahoo. Data is collected from free public feeds, may be delayed or incomplete, and rankings are our own calculations.";
