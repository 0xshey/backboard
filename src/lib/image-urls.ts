export function playerHeadshotURL(playerId: string) {
	return `https://cdn.nba.com/headshots/nba/latest/1040x760/${playerId}.png`;
}

export function playerSiloURL(playerId: string) {
	return `https://cdn.nba.com/silos/nba/latest/440x700/${playerId}.png`;
}

export function teamLogoURL(teamId: string) {
	return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
}
