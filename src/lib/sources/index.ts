import { espnProbeCases } from "./espn/probe";
import { espnCoreProbeCases } from "./espn-core/probe";
import { nbaCdnProbeCases } from "./nba-cdn/probe";
import type { ProbeCase } from "./probe";

/** Default ESPN season (ending year) — 2027 is the 2026-27 season. */
export const CURRENT_ESPN_SEASON = 2027;

export const SOURCES = {
	espn: () => espnProbeCases(CURRENT_ESPN_SEASON),
	"espn-core": () => espnCoreProbeCases(),
	"nba-cdn": () => nbaCdnProbeCases(),
} satisfies Record<string, () => ProbeCase[]>;

export type SourceName = keyof typeof SOURCES;

export function isSourceName(name: string): name is SourceName {
	return name in SOURCES;
}
