"use client";
import { useState, useEffect } from "react";
import { fetchTeam, fetchTeamPlayers, fetchTeamGames } from "@/lib/supabase";

function TeamHeader({ teamId }: { teamId: string }) {
	const [team, setTeam] = useState(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async (teamId: string) => {
			setLoading(true);
			setError(null);

			try {
				// Fetch team
				const { data, error } = await fetchTeam(teamId);
				if (error) throw error;
				setTeam(data);
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(teamId);
	}, [teamId]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<div className="border p-4">
			<h1>Team Header {teamId}</h1>
			<pre>{JSON.stringify(team, null, 2)}</pre>
		</div>
	);
}

function TeamRoster({ teamId }: { teamId: string }) {
	const [players, setPlayers] = useState(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async (teamId: string) => {
			setLoading(true);
			setError(null);

			try {
				// Fetch team players
				const { data, error } = await fetchTeamPlayers(teamId);
				if (error) throw error;
				setPlayers(data);
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(teamId);
	}, [teamId]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<div className="border p-4">
			<h1>Team Roster {teamId}</h1>
			<pre>{JSON.stringify(players, null, 2)}</pre>
		</div>
	);
}

function TeamGames({ teamId }: { teamId: string }) {
	const [games, setGames] = useState(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async (teamId: string) => {
			setLoading(true);
			setError(null);

			try {
				// Fetch team games
				const { data, error } = await fetchTeamGames(teamId);
				if (error) throw error;
				setGames(data);
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(teamId);
	}, [teamId]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<div className="border p-4">
			<h1>Team Games {teamId}</h1>
			<pre>{JSON.stringify(games, null, 2)}</pre>
		</div>
	);
}

export { TeamHeader, TeamRoster, TeamGames };
