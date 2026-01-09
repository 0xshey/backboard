import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TZDate } from "@date-fns/tz";
import { startOfDay, endOfDay } from "date-fns";
import { TopPerformers } from "@/components/home/top-performers";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeroScene } from "@/components/home/hero-scene";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChartScatter } from "lucide-react";

export default async function Page() {
	const supabase = await createClient();

	// Get the most recent date in the game table where status is 3
	const { data: mostRecentFinishedGame, error } = await supabase
		.from("game")
		.select("*")
		.eq("status_code", 3)
		.order("datetime", { ascending: false })
		.limit(1);

	// Handle error or no data
	// For now, if error, we might still want to render the hero, just not the top performers
	// But let's keep existing logic structure for safety, maybe improve error UI later
	let gamePlayers: any[] = [];
	let nyDateStr = new Date().toISOString();

	if (!error && mostRecentFinishedGame?.[0]) {
		const finishedGameDate = mostRecentFinishedGame[0].datetime;
		if (finishedGameDate) {
			// Create a date object that is pinned to America/New_York
			const nyDate = new TZDate(finishedGameDate, "America/New_York");
			nyDateStr = nyDate.toISOString();

			// Get the start and end of that specific day in New York, then convert to UTC ISO string
			const startOfDayUtc = startOfDay(nyDate).toISOString();
			const endOfDayUtc = endOfDay(nyDate).toISOString();

			const { data, error: gamePlayersError } = await supabase
				.from("game_player")
				.select(
					"*, game!inner(*), player!inner(*), team:game_player_team_id_fkey(*), opp_team:game_player_team_opp_id_fkey(*)"
				)
				.order("fp", { ascending: false })
				.gte("game.datetime", startOfDayUtc)
				.lte("game.datetime", endOfDayUtc)
				.limit(5);

			if (!gamePlayersError && data) {
				gamePlayers = data;
			}
		}
	}

	return (
		<div className="relative w-full min-h-screen flex flex-col items-center bg-background overflow-x-hidden">
			{/* Background Gradient */}
			<div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900/40 via-background to-background pointer-events-none" />

			{/* 3D Scene Background */}
			<div className="fixed inset-0 z-0 opacity-100">
				<HeroScene />
			</div>

			{/* Foreground Content */}
			<div className="relative z-10 w-full flex flex-col items-center pt-32 pb-24 px-4">
				{/* Hero Section */}
				<div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
					<h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter mb-6 drop-shadow-2xl">
						Track Today's Fantasy Performers
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl drop-shadow-md">
						Daily rankings, deep analytics, and player consistency
						tools to help you dominate your fantasy basketball
						league.
					</p>

					<div className="flex flex-wrap gap-4 justify-center">
						<Button
							asChild
							size="lg"
							className="rounded-full text-base h-12 px-8 shadow-orange-500/20 shadow-lg hover:shadow-orange-500/40 transition-all"
						>
							<Link href="/rankings">
								Today's Rankings{" "}
								<ArrowRight className="ml-2 w-5 h-5" />
							</Link>
						</Button>
						<Button
							asChild
							variant="secondary"
							size="lg"
							className="rounded-full text-base h-12 px-8 backdrop-blur-sm bg-background/50 border hover:bg-background/80"
						>
							<Link href="/consistency">
								Season Consistency{" "}
								<ChartScatter className="ml-2 w-5 h-5" />
							</Link>
						</Button>
					</div>
				</div>

				{/* Feature / Top Performers Section */}
				<div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
					{gamePlayers.length > 0 ? (
						<TopPerformers
							gamePlayers={gamePlayers}
							nyDate={nyDateStr}
						/>
					) : (
						<div className="w-full h-40 flex items-center justify-center text-muted-foreground glass rounded-xl border border-white/5">
							<p>No games found for the latest date.</p>
						</div>
					)}
				</div>

				{/* Theme Toggle in simplified footer area or absolute top right? 
                    Original had it in the link group. Let's put it top right absolute for now or keep in flow 
                    Actually, let's just leave it out of the main hero flow if not requested? 
                    The user didn't mention it, but it's good to keep access.
                    Navigator has theme toggle, so we don't strictly need it here if Navigator is present. 
                    `layout.tsx` usually includes `Navigator`. 
                    Wait, `src/app/layout.tsx` probably wraps `page.tsx`.
                    If `Navigator` is in layout, we don't need it here.
                    Let's check `layout.tsx` to be sure.
                */}
			</div>
		</div>
	);
}
