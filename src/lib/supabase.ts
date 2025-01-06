'use server'
import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Client
const client = createClient(
	process.env.SUPABASE_URL as string,
	process.env.SUPABASE_KEY as string
)

// Client functions

async function fetchGames(date: Date) {
	const startOfDay = new Date(date)
	startOfDay.setHours(0, 0, 0, 0)

	const endOfDay = new Date(date)
	endOfDay.setHours(23, 59, 59, 999)

	const { data, error } = await client.rpc('get_games_summary', {
		start_time: startOfDay.toISOString(),
		end_time: endOfDay.toISOString()
	});

	return { data, error }
}

async function fetchGameTeams(gameIds: string[]) {
	const { data, error } = await client
		.from('GameTeams_new')
		.select(`
			*
		`)
		.in('gameId', gameIds)

	return { data, error }
}

async function fetchStandings(date: string) {
	const { data, error } = await client
	.from('Standings_new')
	.select(`
		*, 
		teams!inner ( * )
	`)
	
	return { data, error }
}

async function fetchPlayers(date: string) {
	console.log('FETCHING game_players for', date)
	const { data, error } = await client
		.from('game_players')
		.select(`
			*,
			game:game_players_gameId_fkey!inner( * ),
			team:game_players_teamId_fkey!inner( * ),
			opposingTeam:game_players_opposingTeamId_fkey!inner( * )
		`)
		.eq('game.date', date)

	console.log('FETCHED', data?.length, 'game_players')
	return { data, error }
}


export { fetchGames, fetchGameTeams, fetchStandings, fetchPlayers }