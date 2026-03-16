function clamp(x: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, x));
}

export interface FormulaComponents {
	baseAvg: number;
	avgSeason: number;
	avgL10: number | null;
	avgL5: number | null;
	l5GamesCount: number;
	oppDefFactor: number;
	homeAwayFactor: number;
	homeAwaySource: "historical" | "static";
	homeGamesCount: number;
	awayGamesCount: number;
	oppQualityFactor: number;
	isHome: boolean;
}

export interface ProjectionResult {
	playerId: string;
	firstName: string;
	lastName: string;
	teamId: string;
	gameId: string;
	projectedFP: number;
	confidence: number;
	confidenceLabel: "Low" | "Medium" | "High";
	components: FormulaComponents;
	actualFP: number | null;
	played: boolean;
	seasonAvgFP: number;
	/** projectedFP − actualFP; null if game not yet played */
	error: number | null;
}

export interface ProjectionInputs {
	playerId: string;
	firstName: string;
	lastName: string;
	teamId: string;
	gameId: string;
	seasonAvgFP: number;
	gamesPlayed: number;
	variationPct: number | null;
	l10AvgFP: number | null;
	/** FP values from last 5 played games, most-recent first */
	l5GameFPs: number[];
	homeGameFPs: number[];
	awayGameFPs: number[];
	isHome: boolean;
	oppMeanFPAllowed: number;
	leagueMeanFPAllowed: number;
	oppGamesCount: number;
	oppPointsFor: number;
	leagueAvgPointsFor: number;
	actualFP: number | null;
	played: boolean;
}

/**
 * Projected FP formula:
 *   PROJECTED_FP = BASE_FP × OPP_DEF × HOME_AWAY × OPP_QUALITY
 *
 * BASE_FP      — recency-weighted blend of season avg, L10, and L5
 * OPP_DEF      — how many FP this opponent's defense allows vs. league avg
 * HOME_AWAY    — player's historical home or away split vs. season avg
 * OPP_QUALITY  — opponent's pace proxy via points-per-game vs. league avg
 */
export function computeProjectedFP(inputs: ProjectionInputs): ProjectionResult {
	const {
		playerId,
		firstName,
		lastName,
		teamId,
		gameId,
		seasonAvgFP,
		gamesPlayed,
		variationPct,
		l10AvgFP,
		l5GameFPs,
		homeGameFPs,
		awayGameFPs,
		isHome,
		oppMeanFPAllowed,
		leagueMeanFPAllowed,
		oppGamesCount,
		oppPointsFor,
		leagueAvgPointsFor,
		actualFP,
		played,
	} = inputs;

	// ── Factor 1: Blended base ─────────────────────────────────────────────────
	const avgL5 =
		l5GameFPs.length >= 3
			? l5GameFPs.reduce((s, v) => s + v, 0) / l5GameFPs.length
			: null;

	let baseAvg: number;
	if (l10AvgFP != null && avgL5 != null) {
		baseAvg = 0.35 * seasonAvgFP + 0.4 * l10AvgFP + 0.25 * avgL5;
	} else if (l10AvgFP != null) {
		baseAvg = 0.45 * seasonAvgFP + 0.55 * l10AvgFP;
	} else {
		baseAvg = seasonAvgFP;
	}

	// ── Factor 2: Opponent defense ─────────────────────────────────────────────
	const oppDefRaw =
		leagueMeanFPAllowed > 0 ? oppMeanFPAllowed / leagueMeanFPAllowed : 1.0;
	const oppWeight = clamp(oppGamesCount / 20, 0, 1);
	const oppDefFactor = clamp(
		oppDefRaw * oppWeight + 1.0 * (1 - oppWeight),
		0.8,
		1.2,
	);

	// ── Factor 3: Home/Away ────────────────────────────────────────────────────
	const splitFPs = isHome ? homeGameFPs : awayGameFPs;
	let homeAwayFactor: number;
	let homeAwaySource: "historical" | "static";

	if (splitFPs.length >= 5 && seasonAvgFP > 0) {
		const splitAvg = splitFPs.reduce((s, v) => s + v, 0) / splitFPs.length;
		homeAwayFactor = clamp(splitAvg / seasonAvgFP, 0.9, 1.1);
		homeAwaySource = "historical";
	} else {
		homeAwayFactor = isHome ? 1.03 : 0.97;
		homeAwaySource = "static";
	}

	// ── Factor 4: Opponent quality / pace proxy ────────────────────────────────
	const oppQualityFactor = clamp(
		leagueAvgPointsFor > 0 ? oppPointsFor / leagueAvgPointsFor : 1.0,
		0.92,
		1.08,
	);

	// ── Final projection ───────────────────────────────────────────────────────
	const projectedFP =
		baseAvg * oppDefFactor * homeAwayFactor * oppQualityFactor;

	// ── Confidence score ───────────────────────────────────────────────────────
	const confGames = clamp(gamesPlayed / 20, 0, 1);
	const confStability =
		variationPct != null ? 1 - clamp(variationPct / 100, 0, 1) : 0.5;
	const confL5 = clamp(l5GameFPs.length / 5, 0, 1);
	const confOpp = clamp(oppGamesCount / 40, 0, 1);
	const confidence =
		0.35 * confGames + 0.3 * confStability + 0.2 * confL5 + 0.15 * confOpp;
	const confidenceLabel: "Low" | "Medium" | "High" =
		confidence >= 0.65 ? "High" : confidence >= 0.4 ? "Medium" : "Low";

	return {
		playerId,
		firstName,
		lastName,
		teamId,
		gameId,
		projectedFP,
		confidence,
		confidenceLabel,
		components: {
			baseAvg,
			avgSeason: seasonAvgFP,
			avgL10: l10AvgFP,
			avgL5,
			l5GamesCount: l5GameFPs.length,
			oppDefFactor,
			homeAwayFactor,
			homeAwaySource,
			homeGamesCount: homeGameFPs.length,
			awayGamesCount: awayGameFPs.length,
			oppQualityFactor,
			isHome,
		},
		actualFP,
		played,
		seasonAvgFP,
		error: actualFP != null && played ? projectedFP - actualFP : null,
	};
}
