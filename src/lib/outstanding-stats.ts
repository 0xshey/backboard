interface PlayerStats {
	seconds: number;
	points: number;
	rebounds_total: number;
	assists: number;
	steals: number;
	blocks: number;
	turnovers: number;
	field_goals_made: number;
	field_goals_attempted: number;
	three_pointers_made: number;
	three_pointers_attempted: number;
	free_throws_made: number;
	free_throws_attempted: number;
}

function calculateTrueShootingPercentage(
	pts: number,
	fga: number,
	fta: number
): number {
	if (fga === 0 && fta === 0) return 0;
	return pts / (2 * (fga + 0.44 * fta));
}

export function getOutstandingnessScore(
	statLabel: string,
	statValue: number,
	allStats?: PlayerStats
): number {
	let score = 0;

	switch (statLabel.toLowerCase()) {
		case "pts":
		case "points":
			if 	  (statValue >= 45) score = 10;
			else if (statValue >= 35) score = 9;
			else if (statValue >= 38) score = 8;
			else if (statValue >= 30) score = 7;
			else if (statValue >= 14) score = 5;
			else if (statValue >= 8) score = 3;
			else score = 1;
			break;
		case "reb":
		case "rebounds_total":
			if 	  (statValue >= 18) score = 10;
			else if (statValue >= 14) score = 9;
			else if (statValue >= 11) score = 7;
			else if (statValue >= 8) score = 5;
			else if (statValue >= 5) score = 3;
			else if (statValue >= 3) score = 2;
			else score = 1;
			break;
		case "ast":
		case "assists":
			if (statValue >= 16) score = 10;
			else if (statValue >= 13) score = 9;
			else if (statValue >= 10) score = 8;
			else if (statValue >= 7) score = 6;
			else if (statValue >= 5) score = 5;
			else if (statValue >= 3) score = 2;
			else score = 1;
			break;
		case "stl":
		case "steals":
			if (statValue >= 10) score = 10;
			else if (statValue >= 8) score = 9;
			else if (statValue >= 6) score = 8;
			else if (statValue >= 5) score = 7;
			else if (statValue >= 4) score = 5;
			else if (statValue >= 2) score = 3;
			else if (statValue >= 1) score = 2;
			else score = 1;
			break;
		case "blk":
		case "blocks":
			if (statValue >= 10) score = 10;
			else if (statValue >= 8) score = 9;
			else if (statValue >= 6) score = 8;
			else if (statValue >= 5) score = 7;
			else if (statValue >= 4) score = 5;
			else if (statValue >= 2) score = 3;
			else if (statValue >= 1) score = 2;
			else score = 1;
			break;
		case "tov":
		case "turnovers": // Lower is better for turnovers
			if (statValue <= 0) score = 8;
			else if (statValue === 2) score = 6;
			else if (statValue === 2) score = 3;
			else if (statValue === 3) score = 0;
			else if (statValue === 4) score = -5;
			else score = -6; // 5+ turnovers
			break;
		case "fg%":
		case "fg%":
		case "field_goals_percentage":
			if (!allStats || allStats.field_goals_made < 10) {
				score = 0;
			} else {
				if (statValue >= 0.90) score = 10;
				else if (statValue >= 0.80) score = 9;
				else if (statValue >= 0.60) score = 8;
				else if (statValue >= 0.55) score = 5;
				else if (statValue >= 0.45) score = 1;
				else if (statValue >= 0.35) score = -3;
				else if (statValue >= 0.25) score = -6;
				else if (statValue >= 0.15) score = -9;
				else score = -10;
			}
			break;
		case "3p%":
		case "three_pointers_percentage":
			if (!allStats || allStats.three_pointers_made < 4) {
				score = 0;
			} else {
				if (statValue >= 0.80) score = 10;
				else if (statValue >= 0.70) score = 9;
				else if (statValue >= 0.60) score = 8;
				else if (statValue >= 0.50) score = 7;
				else if (statValue >= 0.40) score = 5;
				else if (statValue >= 0.30) score = 3;
				else if (statValue >= 0.25) score = 1;
				else if (statValue >= 0.20) score = -2;
				else if (statValue >= 0.15) score = -4;
				else score = -6;
			}
			break;
		case "ft%":
		case "free_throws_percentage":
			if (!allStats || allStats.free_throws_made < 6) {
				score = 0;
			} else {
				if (statValue >= 0.95) score = 10;
				else if (statValue >= 0.90) score = 8;
				else if (statValue >= 0.85) score = 6;
				else if (statValue >= 0.80) score = 4;
				else if (statValue >= 0.75) score = 2;
				else if (statValue >= 0.70) score = 0;
				else if (statValue >= 0.65) score = -2;
				else if (statValue >= 0.60) score = -4;
				else if (statValue >= 0.55) score = -6;
				else if (statValue >= 0.50) score = -8;
				else score = -10;
			}
			break;
	}

	return score;``
}
