import { RankingsTabs } from "@/components/rankings/rankings-tabs";
import { getPlayersMeta } from "@/lib/data/players";
import { DateTime } from "luxon";

export default function RankingsLayout({ children }: { children: React.ReactNode }) {
	const meta = getPlayersMeta();
	const updated = DateTime.fromISO(meta.fetchedAt).toFormat("MMM d, yyyy");

	return (
		<div className="w-full max-w-6xl mx-auto px-4 pb-16 flex flex-col gap-6">
			<header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-semibold tracking-tighter">Rankings</h1>
					<p className="text-sm text-muted-foreground">
						{meta.season} rosters · {meta.statsSeason} per-game stats · updated {updated}
					</p>
				</div>
				<RankingsTabs />
			</header>
			{children}
		</div>
	);
}
