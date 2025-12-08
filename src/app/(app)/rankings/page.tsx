import { GameChip } from "@/components/game/game-chip";
import { PlayerRankingsGrid } from "@/components/rankings/player-rankings-grid";
import { RankingsControls } from "@/components/rankings/rankings-controls";

import {
	fetchGamePlayersForDate,
	fetchGamePlayersForGameIds,
	fetchGamesForDate,
} from "./functions";

export const revalidate = 60;

export default async function RankingsPage({
	searchParams,
}: {
	searchParams: { date: string };
}) {
	const resolvedSearchParams = await searchParams;
	const todayNYString = new Date()
		.toLocaleDateString("en-CA", {
			timeZone: "America/Los_Angeles",
		})
		.replaceAll("/", "-");
	const dateString = resolvedSearchParams.date || todayNYString;
	const games = await fetchGamesForDate(dateString);
	const gameIds = games.map((g) => g.id);
	const gamePlayers = await fetchGamePlayersForGameIds(gameIds);

	return (
		<div className="w-full flex flex-col items-center gap-4">
			<RankingsControls />
			<div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 items-center gap-2 px-2">
				{games
					.sort((a, b) => a.datetime - b.datetime)
					.sort((a, b) => a.status_code - b.status_code)
					.map((game) => (
					<GameChip key={game.id} game={game} />
				))}
			</div>
			<div className="w-full max-w-6xl flex justify-center gap-4 p-2">
				<PlayerRankingsGrid
					gamePlayers={gamePlayers.filter((p) => p.played)}
				/>
			</div>
		</div>
	);
}
