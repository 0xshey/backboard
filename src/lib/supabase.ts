'use server'
import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'
import { getStartAndEndOfDay } from '@/lib/utils'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Supabase Client
const client = createClient(
	process.env.SUPABASE_URL as string,
	process.env.SUPABASE_KEY as string
)

// Supabase functions
async function fetchGames(date: Date) {
	const { startTime, endTime } = getStartAndEndOfDay(date)

	console.log('FETCHING games for', startTime, endTime)

	const { data, error } = await client.rpc('get_games_summary', {
		start_time: startTime,
		end_time: endTime
	});

	return { data, error }
}

async function fetchPlayers(date: Date) {
	const { startTime, endTime } = getStartAndEndOfDay(date)

	console.log('FETCHING players for', startTime, endTime)

	const { data, error } = await client.rpc('get_players_page', {
		start_time: startTime,
		end_time: endTime
	});

	return { data, error }
}

export { fetchGames, fetchPlayers}