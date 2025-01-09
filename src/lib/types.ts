export type FantasyPlayer = {
	gameId: string;
	playerId: string;
	teamId: string;
	firstName: string;
	lastName: string;
	played: boolean;
	minutes: string;
	points: number;
	assists: number;
	reboundsTotal: number;
	steals: number;
	blocks: number;
	turnovers: number;
	fantasyPoints: number;
	fantasyPointsSeasonAverage: number;
	fantasyPointsDelta: number;
};

export type Game = {
	gameId: string;
	homeTeamId: string;
	homeTeamName: string;
	homeTeamScore: number;
	homeTeamWins: number;
	homeTeamLosses: number;
	awayTeamId: string;
	awayTeamName: string;
	awayTeamScore: number;
	awayTeamWins: number;
	awayTeamLosses: number;
	statusCode: number;
	dateTimeUTC: string;
	statusText: string;
	nationalBroadcaster: string;
};