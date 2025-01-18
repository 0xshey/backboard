export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FantasyPlayer = {
	gameId: string
	playerId: string
	teamId: string
	firstName: string
	lastName: string
	played: boolean
	minutes: string
	points: number
	assists: number
	reboundsTotal: number
	steals: number
	blocks: number
	turnovers: number
	fantasyPoints: number
	fantasyPointsSeasonAverage: number
	fantasyPointsDelta: number
};

export type TeamGame = {
	gameId: string
	teamId: string
	teamName: string
	teamCity: string
	teamTricode: string
	score: number
	inBonus: boolean
	timeoutsRemaining: number
	assists: number
	assistsTurnoverRatio: number
	benchPoints: number
	biggestLead: number
	biggestLeadScore: string
	biggestScoringRun: number
	biggestScoringRunScore: string
	blocks: number
	blocksReceived: number
	fastBreakPointsAttempted: number
	fastBreakPointsMade: number
	fastBreakPointsPercentage: number
	fieldGoalsAttempted: number
	fieldGoalsEffectiveAdjusted: number
	fieldGoalsMade: number
	fieldGoalsPercentage: number
	foulsOffensive: number
	foulsDrawn: number
	foulsPersonal: number
	foulsTeam: number
	foulsTechnical: number
	foulsTeamTechnical: number
	freeThrowsAttempted: number
	freeThrowsMade: number
	freeThrowsPercentage: number
	leadChanges: number
	minutes: string
	points: number
	pointsAgainst: number
	pointsFastBreak: number
	pointsFromTurnovers: number
	pointsInThePaint: number
	pointsInThePaintAttempted: number
	pointsInThePaintMade: number
	pointsInThePaintPercentage: number
	pointsSecondChance: number
	reboundsDefensive: number
	reboundsOffensive: number
	reboundsPersonal: number
	reboundsTeam: number
	reboundsTeamDefensive: number
	reboundsTeamOffensive: number
	reboundsTotal: number
	secondChancePointsAttempted: number
	secondChancePointsMade: number
	secondChancePointsPercentage: number
	steals: number
	threePointersAttempted: number
	threePointersMade: number
	threePointersPercentage: number
	timeLeading: string
	timesTied: number
	trueShootingAttempts: number
	trueShootingPercentage: number
	turnovers: number
	turnoversTeam: number
	turnoversTotal: number
	twoPointersAttempted: number
	twoPointersMade: number
	twoPointersPercentage: number
	pointsDifferential: number
	periods: {
		period: number
		periodType: string
		score: number
	}[]
	game: Game
}

export type Game = {
	gameId: string
	homeTeam: {
		gameId: string
		teamId: string
		teamName: string
		teamCity: string
		teamTricode: string
		score: number
	}
	awayTeam: {
		gameId: string
		teamId: string
		teamName: string
		teamCity: string
		teamTricode: string
		score: number
	}
	dateTimeUTC: string
	statusCode: number
	opposition: string
}

export type GameSummary = {
	gameId: string
	homeTeamId: string
	awayTeamId: string
	homeTeamName: string
	homeTeamScore: number
	awayTeamName: string
	awayTeamScore: number
	statusCode: number
	statusText: string
	dateTimeUTC: string
	nationalBroadcaster: string
	homeTeamWins: number
	homeTeamLosses: number
	homeTeamConference: string
	homeTeamConferenceRank: number
	awayTeamWins: number
	awayTeamLosses: number
	awayTeamConference: string
	awayTeamConferenceRank: number
}

export type PlayerSeasonAverage = {
	assists: number
	assistsRank: number
	blocks: number
	blocksRank: number
	blocksReceived: number
	blocksReceivedRank: number
	doubleDoubles: number
	doubleDoublesRank: number
	fantasyPoints: number
	fantasyPointsRank: number
	fieldGoalsAttempted: number
	fieldGoalsAttemptedRank: number
	fieldGoalsMade: number
	fieldGoalsMadeRank: number
	fieldGoalsPercentage: number
	fieldGoalsPercentageRank: number
	foulsDrawn: number
	foulsDrawnRank: number
	foulsPersonal: number
	foulsPersonalRank: number
	freeThrowsAttempted: number
	freeThrowsAttemptedRank: number
	freeThrowsMade: number
	freeThrowsMadeRank: number
	freeThrowsPercentage: number
	freeThrowsPercentageRank: number
	gamesPlayed: number
	gamesPlayedRank: number
	losses: number
	lossesRank: number
	minutes: number
	minutesRank: number
	playerAge: number
	playerId: string
	playerName: string
	plusMinusPoints: number
	plusMinusPointsRank: number
	points: number
	pointsRank: number
	reboundsDefensive: number
	reboundsDefensiveRank: number
	reboundsOffensive: number
	reboundsOffensiveRank: number
	reboundsTotal: number
	reboundsTotalRank: number
	steals: number
	stealsRank: number
	teamId: string
	teamTricode: string
	threePointersAttempted: number
	threePointersAttemptedRank: number
	threePointersMade: number
	threePointersMadeRank: number
	threePointersPercentage: number
	threePointersPercentageRank: number
	tripleDoubles: number
	tripleDoublesRank: number
	turnovers: number
	turnoversRank: number
	winPercentage: number
	winPercentageRank: number
	wins: number
	winsRank: number
}

export type Standing = {
	awayRecord: string | null
	awayStreak: number | null
	clinchedConference: boolean | null
	clinchedDivision: boolean | null
	clinchedPlayIn: boolean | null
	clinchedPlayoff: boolean | null
	conference: string | null
	conferenceRank: number | null
	conferenceRecord: string | null
	division: string | null
	divisionRank: number | null
	divisionRecord: string | null
	eliminatedConference: boolean | null
	eliminatedDivision: boolean | null
	gamesPlayed: number | null
	homeRecord: string | null
	homeStreak: number | null
	l10Record: string | null
	losses: number | null
	pointsAgainst: number | null
	pointsFor: number | null
	seasonId: string
	teamCity: string | null
	teamId: string
	winPct: number | null
	wins: number | null
}

export type TeamHeader = {
	teamId: string
	city: string
	name: string
	slug: string
	conference: string
	division: string
	tricode: string
	wins: number
	losses: number
	winPct: number
	gamesPlayed: number
	clinchedConference: boolean
	clinchedDivision: boolean
	clinchedPlayoff: boolean
	clinchedPlayIn: boolean
	eliminatedConference: boolean
	eliminatedDivision: boolean
	conferenceRank: number
	divisionRank: number
	conferenceRecord: string
	divisionRecord: string
	homeRecord: string
	awayRecord: string
	l10Record: string
	homeStreak: number
	awayStreak: number
	pointsFor: number
	pointsAgainst: number
}