import { GameChip } from "@/components/game/game-chip";
import { PlayerRankingsTable } from "@/components/rankings/player-rankings-table";
import { RankingsControls } from "@/components/rankings/rankings-controls";

import {
	fetchGamePlayersForDate,
	fetchGamePlayersForGameIds,
	fetchGamesForDate,
} from "./functions";

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
			<div className="w-full max-w-xl grid grid-cols-2 items-center gap-2 px-2">
				{games.map((game) => (
					<GameChip key={game.id} game={game} />
				))}
			</div>
			<div className="w-full max-w-6xl flex justify-center gap-4 p-2">
				<PlayerRankingsTable
					gamePlayers={gamePlayers.filter((p) => p.played)}
				/>
			</div>
			{/* <pre>{JSON.stringify([gamePlayers[0]], null, 2)}</pre> */}
		</div>
	);
}
