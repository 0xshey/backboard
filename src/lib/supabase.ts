'use server'
import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Client
const client = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY
)

// Client functions
async function fetchGames(date: string) {
	const { data, error } = await client
		.from('games')
		.select(`
			*,
			homeTeam( * ),
			awayTeam( * )
		`)
		.eq('date', date)

	return { data, error }
}

async function fetchStandings(date: string) {
	const { data, error } = await client
	.from('standings')
	.select(`
		*, 
		teams!inner ( * )
	`)
	.eq('date', date)
	
	return { data, error }
}

async function fetchPlayers(date: string) {
	console.log(date)
	let { data, error } = await client
		.from('game_players')
		.select(`
			*,
			games!inner ( * ),
			team!inner( * ),
			opposingTeam!inner( * )
		`)
		.eq('games.date', date)
		.eq('played', true)
	return { data, error }
}


export { fetchGames, fetchStandings, fetchPlayers }