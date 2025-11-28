import { Suspense } from "react";
import { ScheduleControls } from "@/components/schedule/schedule-controls";
// import { ScheduleGrouped } from "@/components/schedule/schedule-grouped";
import { ScheduleGrid } from "@/components/schedule/schedule-grid";

import {
	getTeams,
	getFantasyGameWeeks,
	getGamesForFantasyWeek,
	deriveGamesByTeam,
	deriveTeamsGroupedByGameCount,
} from "./functions";

import { FantasyProvider, Game, GameWeekFantasy, Team } from "@/types";

export default async function SchedulePage({
	searchParams,
}: {
	searchParams: { provider?: string; week?: number };
}) {
	const resolvedSearchParams = await searchParams;
	const provider = resolvedSearchParams.provider || "yahoo";
	const week = resolvedSearchParams.week || 1;

	// Fetch page data
	const teams = await getTeams();
	const fantasyGameWeeks = await getFantasyGameWeeks();
	const fantasyGamesByWeek = await getGamesForFantasyWeek(
		week,
		provider as FantasyProvider
	);

	// Derived data
	const gamesByTeam: Record<string, Game[]> = await deriveGamesByTeam(
		teams,
		fantasyGamesByWeek as Game[]
	);
	const teamsGroupedByGameCount = await deriveTeamsGroupedByGameCount(
		teams,
		gamesByTeam
	);

	return (
		<main className="w-full max-w-4xl min-h-screen bg-background text-foreground flex flex-col items-center">
			<h1 className="text-4xl sm:text-5xl font-medium mb-8">
				Advanced Schedule
			</h1>

			<div className="flex justify-center px-2">
				<ScheduleControls />
			</div>

			<Suspense>
				<ScheduleGrid
					fantasyGameWeek={
						fantasyGameWeeks.find(
							(fgw: GameWeekFantasy) =>
								fgw.number === Number(week)
						)!
					}
					gamesByTeam={gamesByTeam}
					teams={teams}
				/>
			</Suspense>
		</main>
	);
}
