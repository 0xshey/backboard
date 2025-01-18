"use client";
import { useState, useEffect } from "react";
import { fetchTeamPlayers } from "@/lib/supabase";
import { cn, ordinalSuffix } from "@/lib/utils";
import { PlayerSeasonAverage } from "@/lib/types";
import PlayerSilo from "@/components/nba/player-silo";
import Loader from "@/components/loader";

export default function TeamRoster({ teamId }: { teamId: string }) {
	const [players, setPlayers] = useState<PlayerSeasonAverage[] | null>(null);
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

	if (loading) return <Loader className="w-full max-w-4xl" />;
	if (error) return <p>Error: {error.message}</p>;
	if (!players || players.length == 0) return <p>No players found</p>;

	return (
		<div className="px-2 w-full max-w-4xl flex flex-col items-center">
			<div className="flex justify-center w-full -space-x-24">
				{players
					.sort((a, b) => b.fantasyPoints - a.fantasyPoints)
					.slice(0, 5)
					.sort((a, b) => {
						const order = [4, 2, 1, 3, 5];
						return (
							order.indexOf(players.indexOf(a) + 1) -
							order.indexOf(players.indexOf(b) + 1)
						);
					})
					.map((player) => (
						<PlayerSilo
							key={player.playerId}
							playerId={player.playerId}
							className="w-[180px] md:w-[300px]"
							// size={300}
						/>
					))}
			</div>
			<table className="w-full">
				<thead>
					<tr>
						{[
							"Player",
							"GP",
							"PTS",
							"REB",
							"AST",
							"STL",
							"BLK",
							"TOV",
							"FP",
						].map((header) => (
							<th
								key={header}
								className={cn(
									"font-medium text-muted-foreground/40 text-sm md:text-lg",
									header === "Player" && "text-left"
								)}
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{players
						.sort((a, b) => b.fantasyPoints - a.fantasyPoints)
						.map((player) => (
							<PlayerRow key={player.playerId} player={player} />
						))}
				</tbody>
			</table>
			{/* <pre>{JSON.stringify(players, null, 2)}</pre> */}
		</div>
	);
}

function StatCell({
	value,
	rank,
	isBad = false,
}: {
	value: string | number | null;
	rank?: number | null;
	isBad?: boolean;
}) {
	const colors = {
		best: "text-lime-600 bg-lime-600/20 border-lime-600 border-b",
		better: "text-green-600 bg-green-600/20 border-green-600",
		good: "text-teal-600 bg-teal-600/20 border-teal-600",
		average:
			"opacity-0 group-hover:opacity-100 text-muted-foreground bg-muted-foreground/20 border-muted-foreground",
		bad: "text-orange-600 bg-orange-600/20 border-red-600",
		worst: "text-red-600 bg-red-600/20 border-red-600 border-b",
	};

	const rankColors = [
		{ maxRank: 3, color: isBad ? colors.worst : colors.best },
		{ minRank: 4, maxRank: 10, color: isBad ? colors.bad : colors.better },
		{ minRank: 11, maxRank: 25, color: isBad ? colors.bad : colors.good },
		{ minRank: 26, maxRank: 499, color: colors.average },
		{ minRank: 490, maxRank: 509, color: isBad ? colors.good : colors.bad },
		{ minRank: 510, color: isBad ? colors.better : colors.worst },
	];

	const rankColor = rankColors.find(
		({ minRank = -Infinity, maxRank = Infinity }) =>
			rank && rank !== undefined && rank >= minRank && rank <= maxRank
	)?.color;

	const rankClasses = cn(
		"absolute-center-x bottom-0.5 text-[0.5rem] md:text-[0.6rem] text-muted font-medium rounded-full px-1",
		rankColor,
		rank == undefined && "hidden"
	);

	return (
		<td className="text-center relative">
			<div className="text-sm md:text-lg md:py-2 leading-10 transition-all duration-300 group-hover:-translate-y-1.5">
				{value}
			</div>
			<span className={rankClasses}>
				{rank}
				{ordinalSuffix(rank)}
			</span>
		</td>
	);
}

function PlayerRow({ player }: { player: PlayerSeasonAverage }) {
	return (
		<tr key={player.playerId} className="group cursor-default border-b">
			<td className="text-sm md:text-lg whitespace-nowrap truncate pr-4 max-w-28 md:max-w-none">
				{player.playerName}
			</td>
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
			<StatCell
				value={player.turnovers}
				rank={player.turnoversRank}
				isBad
			/>
			<StatCell
				value={player.fantasyPoints}
				rank={player.fantasyPointsRank}
			/>
		</tr>
	);
}
