'use server'
import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'
import { getStartAndEndOfDay } from '@/lib/utils'

const projectDir = process.cwd()
loadEnvConfig(projectDir)

// Client
const client = createClient(
	process.env.SUPABASE_URL as string,
	process.env.SUPABASE_KEY as string
)

// Functions
async function fetchGames(date: Date) {
	const { startTime, endTime } = getStartAndEndOfDay(date)

	console.log('FETCHING games for', startTime, endTime)

	const { data, error } = await client.rpc('get_games_page', {
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

async function fetchTeamHeader(teamId: string) {
	const { data, error } = await client.rpc('get_team_header', {
		team_id: teamId
	})

	return { data, error }
}

async function fetchTeamPlayers(teamId: string) {
	const { data, error } = await client
		.from('PlayerSeasonAverages')
		.select('*')
		.eq('teamId', teamId)

	return { data, error }
}

async function fetchTeamGames(teamId: string) {
	const { data, error } = await client.rpc('get_team_games', {
		team_id: teamId
	});

	return { data, error }
}

async function fetchStandings() {
	const { data, error } = await client
		.from('Standings')
		.select('*')
	
	return { data, error }
}

export { fetchGames, fetchPlayers, fetchTeamHeader, fetchTeamPlayers, fetchTeamGames, fetchStandings }
