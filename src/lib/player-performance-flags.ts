interface PlayerGame {
	game_id: string;
	player_id: string;
	team_id: string;
	assists: number;
	blocks: number;
	field_goals_attempted: number;
	field_goals_made: number;
	field_goals_percentage: number;
	points: number;
	rebounds_defensive: number;
	rebounds_offensive: number;
	rebounds_total: number;
	steals: number;
	three_pointers_attempted: number;
	three_pointers_made: number;
	three_pointers_percentage: number;
	turnovers: number;
	free_throws_attempted: number; // Added for 'ethical' flag
	free_throws_made: number; // Added for 'ethical' flag
	// Add other properties from the player_game object as needed
	// For brevity, only relevant ones for flags are included here.
}

type PerformanceFlag =
	| 'Sniper'
	| 'Double-Double'
	| 'Triple-Double'
	| 'Quadruple-Double'
	| '4x5'
	| '5x5'
	| 'Perfect'
	| 'Perfect+'
	| 'Perfect++'
	| 'Pristine'
	| 'Cookies'
	| 'Block Party'
	| 'Block Party+'
	| 'Block Party++'
	| 'Bricklayer'
	| 'Butterfingers'
	| 'Dishing'
	| 'Ethical';

/**
 * Calculates the true shooting percentage (TS%) for a player game.
 * TS% = Points / (2 * (FGA + 0.44 * FTA))
 */
function trueShootingPct(playerGame: PlayerGame): number {
	const { points, field_goals_attempted, free_throws_attempted } = playerGame;
	const denominator = 2 * (field_goals_attempted + 0.44 * free_throws_attempted);
	return denominator > 0 ? points / denominator : 0;
}

export function getPerformanceFlags(playerGame: PlayerGame): PerformanceFlag[] {
	const flags: PerformanceFlag[] = [];

	// Double-Double, Triple-Double, Quadruple-Double
	let doubleDigitCategories = 0;
	if (playerGame.points >= 10) doubleDigitCategories++;
	if (playerGame.rebounds_total >= 10) doubleDigitCategories++;
	if (playerGame.assists >= 10) doubleDigitCategories++;
	if (playerGame.steals >= 10) doubleDigitCategories++;
	if (playerGame.blocks >= 10) doubleDigitCategories++;

	if (doubleDigitCategories >= 2) {
		flags.push('Double-Double');
	}
	if (doubleDigitCategories >= 3) {
		flags.push('Triple-Double');
	}
	if (doubleDigitCategories >= 4) {
		flags.push('Quadruple-Double');
	}

	// 4x5 and 5x5
	let fivePlusCategories = 0;
	if (playerGame.points >= 5) fivePlusCategories++;
	if (playerGame.rebounds_total >= 5) fivePlusCategories++;
	if (playerGame.assists >= 5) fivePlusCategories++;
	if (playerGame.steals >= 5) fivePlusCategories++;
	if (playerGame.blocks >= 5) fivePlusCategories++;

	if (fivePlusCategories >= 4) {
		flags.push('4x5');
	}
	if (fivePlusCategories >= 5) {
		flags.push('5x5');
	}

	// Perfect FG% flags
	if (playerGame.field_goals_attempted >= 5 && playerGame.field_goals_percentage === 1) {
		flags.push('Perfect');
	}
	if (playerGame.field_goals_attempted >= 10 && playerGame.field_goals_percentage === 1) {
		flags.push('Perfect+');
	}
	if (playerGame.field_goals_attempted >= 15 && playerGame.field_goals_percentage === 1) {
		flags.push('Perfect++');
	}
	if (playerGame.field_goals_attempted >= 20 && playerGame.field_goals_percentage === 1) {
		flags.push('Pristine');
	}

	// Cookies (steals)
	if (playerGame.steals >= 5) {
		flags.push('Cookies');
	}

	// Block Party flags
	if (playerGame.blocks >= 15) {
		flags.push('Block Party++');
	} else if (playerGame.blocks >= 10) {
		flags.push('Block Party+');
	} else if (playerGame.blocks >= 5) {
		flags.push('Block Party');
	}

	// Bricklayer
	if (playerGame.field_goals_attempted >= 10 && playerGame.field_goals_percentage < 0.15) {
		flags.push('Bricklayer');
	}

	// Butterfingers
	if (playerGame.turnovers >= 5) {
		flags.push('Butterfingers');
	}

	// Dishing
	if (playerGame.assists >= 5) {
		flags.push('Dishing');
	}

	// Ethical
	if (playerGame.points >= 15 && trueShootingPct(playerGame) >= 0.7 && (playerGame.free_throws_made / playerGame.points < 0.2)) {
		flags.push('Ethical');
	}

	return flags;
}
