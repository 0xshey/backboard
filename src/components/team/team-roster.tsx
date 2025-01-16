"use client";
import { useState, useEffect } from "react";
import { fetchTeamPlayers } from "@/lib/supabase";
import { cn, ordinalSuffix } from "@/lib/utils";

export default function TeamRoster({ teamId }: { teamId: string }) {
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
	if (!players || players.length == 0) return <p>No players found</p>;

	return (
		<div className="border p-4 w-full max-w-xl">
			<table className="w-full max-w-xl">
				<thead>
					<tr>
						<th className="font-medium text-muted text-left">
							Player
						</th>
						{/* <th className="font-medium text-muted">Age</th> */}
						<th className="font-medium text-muted">GP</th>
						<th className="font-medium text-muted">PTS</th>
						<th className="font-medium text-muted">REB</th>
						<th className="font-medium text-muted">AST</th>
						<th className="font-medium text-muted">STL</th>
						<th className="font-medium text-muted">BLK</th>
						<th className="font-medium text-muted">TOV</th>
						<th className="font-medium text-muted">FP</th>
					</tr>
				</thead>
				<tbody>
					{players
						.sort((a, b) => b.fantasyPoints - a.fantasyPoints)
						.map((player) => (
							<PlayerRow key={player.id} player={player} />
						))}
				</tbody>
			</table>
			{/* <pre>{JSON.stringify(players, null, 2)}</pre> */}
		</div>
	);
}

function StatCell({ value, rank }: { value: string | number; rank?: number }) {
	const rankColors = [
		{ maxRank: 3, color: "text-gold-600" },
		{ maxRank: 10, color: "text-green-600" },
		{ maxRank: 25, color: "text-blue-600" },
		{ minRank: 500, color: "text-red-600" },
		{
			minRank: 26,
			maxRank: 499,
			color: "opacity-0 group-hover:opacity-100",
		},
	];

	const rankColor = rankColors.find(
		({ minRank = -Infinity, maxRank = Infinity }) =>
			rank !== undefined && rank >= minRank && rank <= maxRank
	)?.color;

	const rankClasses = cn(
		"absolute-center-x bottom-0 text-xs text-muted font-medium",
		rankColor,
		rank == undefined && "hidden"
	);

	return (
		<td className="text-center h-6 relative">
			<div className="text-lg leading-10 pb-2">{value}</div>
			<span className={rankClasses}>
				<span>{rank}</span>
				<span>{ordinalSuffix(rank)}</span>
			</span>
		</td>
	);
}

function PlayerRow({ player }) {
	return (
		<tr key={player.id} className="group cursor-default border-b">
			<td>{player.playerName}</td>
			{/* <StatCell value={player.playerAge} /> */}
			<StatCell
				value={player.gamesPlayed}
				rank={player.gamesPlayedRank}
			/>
			<StatCell value={player.points} rank={player.pointsRank} />
			<StatCell
				value={player.reboundsTotal}
				rank={player.reboundsTotalRank}
			/>
			<StatCell value={player.assists} rank={player.assistsRank} />
			<StatCell value={player.steals} rank={player.stealsRank} />
			<StatCell value={player.blocks} rank={player.blocksRank} />
			<StatCell value={player.turnovers} rank={player.turnoversRank} />
			<StatCell
				value={player.fantasyPoints}
				rank={player.fantasyPointsRank}
			/>
		</tr>
	);
}
