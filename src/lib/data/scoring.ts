import type { PlayerSeasonStats } from "@/lib/sources/types";

export type PointsPreset = "yahoo" | "espn";

/** Points-league scoring weights per stat. */
export const POINTS_PRESETS: Record<PointsPreset, { label: string; weights: Partial<Record<keyof PlayerSeasonStats, number>> }> = {
	yahoo: {
		label: "Yahoo",
		weights: { pts: 1, reb: 1.2, ast: 1.5, stl: 3, blk: 3, tov: -1 },
	},
	espn: {
		label: "ESPN",
		weights: { pts: 1, fg3m: 1, fga: -1, fgm: 2, fta: -1, ftm: 1, reb: 1, ast: 2, stl: 4, blk: 4, tov: -2 },
	},
};

export function fantasyPoints(stats: PlayerSeasonStats, preset: PointsPreset = "yahoo") {
	let total = 0;
	for (const [key, weight] of Object.entries(POINTS_PRESETS[preset].weights)) {
		total += (stats[key as keyof PlayerSeasonStats] as number) * (weight ?? 0);
	}
	return total;
}

/**
 * Simple dynasty value: current per-game production scaled by an age curve that
 * peaks around 24–27 and declines after 30. Placeholder until we model
 * projections properly.
 */
export function dynastyScore(fpPerGame: number, age: number | null) {
	if (age == null) return fpPerGame;
	const ageFactor =
		age <= 21 ? 1.25 : age <= 23 ? 1.15 : age <= 27 ? 1 : age <= 30 ? 0.9 : Math.max(0.5, 0.9 - (age - 30) * 0.08);
	return fpPerGame * ageFactor;
}

export const CATEGORY_KEYS = ["fgPct", "ftPct", "fg3m", "pts", "reb", "ast", "stl", "blk", "tov"] as const;

/** 9-cat z-scores — stub for the Categories page. */
export function categoryZScores(): never {
	throw new Error("categoryZScores is not implemented yet");
}
