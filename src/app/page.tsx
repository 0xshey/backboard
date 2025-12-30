import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TZDate } from "@date-fns/tz";
import { startOfDay, endOfDay } from "date-fns";
import { TopPerformers } from "@/components/home/top-performers";
import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChartScatter, ListOrdered } from "lucide-react";

export default async function Page() {
	const supabase = await createClient();

	// Get the most recent date in the game table where status is 3
	const { data: mostRecentFinishedGame, error } = await supabase
		.from("game")
		.select("*")
		.eq("status_code", 3)
		.order("datetime", { ascending: false })
		.limit(1);

	if (error || !mostRecentFinishedGame?.[0]) {
		return <p>error loading data: {error?.message || "No data"}</p>;
	}

	const finishedGameDate = mostRecentFinishedGame[0].datetime;
	if (!finishedGameDate) {
		return <p>no datetime found for the latest game</p>;
	}

	// Create a date object that is pinned to America/New_York
	const nyDate = new TZDate(finishedGameDate, "America/New_York");

	// Get the start and end of that specific day in New York, then convert to UTC ISO string
	const startOfDayUtc = startOfDay(nyDate).toISOString();
	const endOfDayUtc = endOfDay(nyDate).toISOString();

	const { data: gamePlayers, error: gamePlayersError } = await supabase
		.from("game_player")
		.select(
			"*, game!inner(*), player!inner(*), team:game_player_team_id_fkey(*), opp_team:game_player_team_opp_id_fkey(*)"
		)
		.order("fp", { ascending: false })
		.gte("game.datetime", startOfDayUtc)
		.lte("game.datetime", endOfDayUtc)
		.limit(5);

	if (gamePlayersError) {
		return <p>error loading game players: {gamePlayersError.message}</p>;
	}

	return (
		// Layout
		<div className="w-full mx-auto pb-24">
			{/* Header */}
			<div className="w-full max-w-7xl mx-auto h-80 flex items-center justify-center rounded-xl mt-24">
				<h1 className="text-[6rem] md:text-[8rem] lg:text-[15rem] font-semibold tracking-tighter">
					Backboard
				</h1>
			</div>

			<div className="w-full max-w-xl mx-auto mt-24 flex items-center justify-center gap-2 p-2">
				<Button asChild variant="default">
					<Link href={"/rankings"}>
						Today's Rankings <ListOrdered />
					</Link>
				</Button>
				<Button asChild variant="secondary">
					<Link href={"/consistency"}>
						Season Consistency <ChartScatter />
					</Link>
				</Button>
				<ThemeToggle />
			</div>

			<div className="w-full max-w-7xl mx-auto px-4 mt-24">
				<TopPerformers
					gamePlayers={gamePlayers || []}
					nyDate={nyDate.toISOString()}
				/>
			</div>

			{/* Landing tiles */}
			{/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-8 w-full max-w-6xl mx-auto">
				<div className="bg-muted w-full col-span-2"></div>
				<div className="bg-muted w-full aspect-1/1"></div>
				<div className="bg-muted w-full aspect-1/1"></div>
				<div className="bg-muted w-full aspect-1/1"></div>
				<div className="bg-muted w-full aspect-1/1"></div>
				<div className="bg-muted w-full aspect-1/1"></div>
				<div className="bg-muted w-full aspect-1/1"></div>
				<div className="bg-muted w-full aspect-1/1"></div>
			</div> */}
		</div>
	);
}
