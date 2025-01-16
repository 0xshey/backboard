"use client";
import { useState, useEffect } from "react";
import { fetchTeam } from "@/lib/supabase";
import TeamLogo from "@/components/nba/team-logo";

export default function TeamHeader({ teamId }: { teamId: string }) {
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
	if (!team) return <p>No team found</p>;

	return (
		<div className="border rounded p-4 w-full max-w-xl relative min-h-80">
			<div className="flex flex-col items-center gap-1 text-5xl whitespace-nowrap z-10 absolute-center">
				<p className="font-extralight">{team.city}</p>
				<p className="font-medium">{team.name}</p>
			</div>
			<TeamLogo
				teamId={teamId}
				size={300}
				className="opacity-20 -z-10 absolute-center"
			/>

			{/* <pre>{JSON.stringify(team, null, 2)}</pre> */}
		</div>
	);
}
