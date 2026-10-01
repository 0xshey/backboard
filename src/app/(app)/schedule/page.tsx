import { ScheduleGrid } from "./schedule-grid";
import { DataSourceInfo } from "@/components/data-source-info";
import { SOURCES } from "@/lib/data/data-sources";
import { formatUpdated } from "@/lib/data/format";
import {
	getCurrentWeekIdx,
	getGames,
	getScheduleMeta,
	getTeams,
	getWeeks,
} from "@/lib/data/schedule";

export const metadata = { title: "Schedule · Backboard" };

// Re-render hourly so the default week rolls over on Mondays.
export const revalidate = 3600;

export default function SchedulePage() {
	const meta = getScheduleMeta();
	const weeks = getWeeks();

	return (
		<div className="w-full max-w-6xl px-2 pb-12">
			<div className="mb-6 mt-12 px-2 space-y-1">
				<h1 className="text-4xl font-semibold">Schedule</h1>
				<div className="flex items-center gap-1.5">
					<p className="text-sm text-muted-foreground">
						{meta.season} NBA game calendar by Yahoo fantasy week.
					</p>
					<DataSourceInfo
						sources={[
							...(meta.source === "nba-cdn"
								? [SOURCES.nbaSchedule, SOURCES.espnScheduleCheck]
								: [SOURCES.espnSchedule, SOURCES.nbaScheduleCheck]),
							SOURCES.yahooWeeks,
							SOURCES.nbaImages,
						]}
						updated={formatUpdated(meta.fetchedAt)}
						note="NBA Cup knockout games are added once matchups are set in December. Yahoo doesn't publish its weeks openly, so we derive them with Yahoo's rules (short opening week, extended All-Star week); these matched Yahoo's 2025-26 weeks exactly."
					/>
				</div>
			</div>
			<ScheduleGrid
				weeks={weeks}
				teams={getTeams()}
				games={getGames()}
				initialWeekIdx={getCurrentWeekIdx(weeks)}
			/>
		</div>
	);
}
