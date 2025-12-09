import { GameChip } from "@/components/game/game-chip";
import { PlayerRankingsGrid } from "@/components/rankings/player-rankings-grid";
import {
	fetchGamePlayersForGameIds,
	fetchGamesForDate,
} from "./functions";

export async function RankingsContent({ date }: { date: string }) {
	const games = await fetchGamesForDate(date);
	const gameIds = games.map((g) => g.id);
	const gamePlayers = await fetchGamePlayersForGameIds(gameIds);

	return (
		<>
			<div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 items-center gap-2 px-2">
				{games
					.sort((a, b) => (new Date(a.datetime ?? 0).getTime()) - (new Date(b.datetime ?? 0).getTime()))
					.sort((a, b) => (a.status_code ?? 0) - (b.status_code ?? 0))
					.map((game) => (
						<GameChip key={game.id} game={game} />
					))}
			</div>
			<div className="w-fit max-w-full flex justify-center gap-4 p-2">
				{gamePlayers.length > 0 ? (
					<PlayerRankingsGrid
						gamePlayers={gamePlayers.filter((p) => p.played)}
					/>
				) : (
					<p className="text-center mt-20 text-muted-foreground text-sm italic">
						No players have played today
					</p>
				)}
			</div>
		</>
	);
}
