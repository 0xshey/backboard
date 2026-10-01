import type { ProbeCase } from "../probe";
import { nbaCdnHeaders, nbaCdnUrls } from "./client";
import { RawBoxscore, RawScheduleLeague, RawScoreboard } from "./raw";

export function nbaCdnProbeCases(): ProbeCase[] {
	return [
		{ name: "schedule", url: nbaCdnUrls.schedule(), schema: RawScheduleLeague, headers: nbaCdnHeaders },
		{ name: "scoreboard", url: nbaCdnUrls.scoreboard(), schema: RawScoreboard, headers: nbaCdnHeaders },
		{ name: "boxscore", url: nbaCdnUrls.boxscore("0022400061"), schema: RawBoxscore, headers: nbaCdnHeaders },
	];
}
