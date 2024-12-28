export type PlayerGameRow = {
	id: number;
	status: string;
	order: number;
	firstName: string;
	lastName: string;
	jersey: string;
	position: string | null;
	onCourt: boolean;
	starter: boolean;
	played: boolean;
	fp: number;
	points: number;
	reboundsTotal: number;
	assists: number;
	steals: number;
	blocks: number;
	turnovers: number;
	fieldGoalsAttempted: number;
	fieldGoalsMade: number;
	fieldGoalsPercentage: number;
	threePointersAttempted: number;
	threePointersMade: number;
	threePointersPercentage: number;
	twoPointersAttempted: number;
	twoPointersMade: number;
	twoPointersPercentage: number;
	freeThrowsAttempted: number;
	freeThrowsMade: number;
	freeThrowsPercentage: number;
	foulsPersonal: number;
	foulsTechnical: number;
	foulsOffensive: number;
	foulsDrawn: number;
	blocksReceived: number;
	plus: number;
	minus: number;
	plusMinusPoints: number;
	minutes: string; // ISO 8601 duration format (e.g., PT11M53.99S)
	pointsFastBreak: number;
	pointsInThePaint: number;
	pointsSecondChance: number;
	reboundsDefensive: number;
	reboundsOffensive: number;
	notPlayingDescription: string;
	notPlayingReason: string;
	gameId: string;
	stillPlaying: boolean;
	tags: string[];
	fpDelta: number;
	team: {
		id: string;
		city: string;
		name: string;
	};
	opposingTeam: {
		id: string;
		city: string;
		name: string;
	};

	game: {
		id: string;
		code: string;
		date: string; // ISO 8601 date format (e.g., 2024-12-21)
		arena: string;
		order: number;
		awayTeam: string;
		homeTeam: string;
		liveClock: string;
		livePeriod: string;
		statusCode: number;
		statusText: string;
		awayTeamGame: {
			score: number;
			linescore: number[];
			seasonRecord: string;
		};
		homeTeamGame: {
			score: number;
			linescore: number[];
			seasonRecord: string;
		};
		nationalBroadcaster: string;
	};
};
  