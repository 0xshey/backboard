import Link from "next/link";
import { GameChip } from "@/components/game/game-chip";
import { PlayerRankingsGrid } from "@/components/rankings/player-rankings-grid";
import {
	fetchGamePlayersForGameIds,
	fetchGamesForDate,
	fetchMostRecentDateWithPlayers,
	fetchStandingsForTeams,
} from "./functions";

export async function RankingsContent({ date }: { date: string }) {
	const games = await fetchGamesForDate(date);
	const gameIds = games.map((g) => g.id);

	const teamIds = [
		...new Set(
			games
				.flatMap((g: any) => [g.away_team?.id, g.home_team?.id])
				.filter(Boolean),
		),
	] as string[];

	const [gamePlayers, standings] = await Promise.all([
		fetchGamePlayersForGameIds(gameIds),
		fetchStandingsForTeams(teamIds),
	]);

	const isEmpty = gamePlayers.length === 0;
	const mostRecentDate = isEmpty
		? await fetchMostRecentDateWithPlayers()
		: null;

	return (
		<>
			<div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 items-center gap-2 px-2">
				{games
					.sort(
						(a, b) =>
							new Date(a.datetime ?? 0).getTime() -
							new Date(b.datetime ?? 0).getTime(),
					)
					.sort((a, b) => (a.status_code ?? 0) - (b.status_code ?? 0))
					.map((game) => (
						<GameChip
							key={game.id}
							game={game}
							standings={standings}
						/>
					))}
			</div>
			<div className="w-fit max-w-full flex justify-center gap-4 p-2">
				{!isEmpty ? (
					<PlayerRankingsGrid
						gamePlayers={gamePlayers.filter((p) => p.played)}
					/>
				) : (
					<div className="flex flex-col items-center gap-4 mt-20">
						<p className="text-center text-muted-foreground text-sm italic">
							No players have played on this date
						</p>
						{mostRecentDate && (
							<Link
								href={`/rankings?date=${mostRecentDate}`}
								className="text-sm px-4 py-2 rounded-md border border-border bg-muted hover:bg-accent transition-colors"
							>
								Go to most recent game records
							</Link>
						)}
					</div>
				)}
			</div>
		</>
	);
}
