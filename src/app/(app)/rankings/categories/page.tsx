import { DataSourceInfo } from "@/components/data-source-info";
import { SOURCES } from "@/lib/data/data-sources";

export const metadata = { title: "Category Rankings · Backboard" };

const PLANNED_COLUMNS = ["FG%", "FT%", "3PM", "PTS", "REB", "AST", "STL", "BLK", "TO", "Total z"];

export default function CategoriesRankingsPage() {
	return (
		<section className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-20 px-6 text-center">
			<div className="flex items-center gap-1.5">
				<h2 className="text-xl font-semibold tracking-tight">9-category rankings are coming soon</h2>
				<DataSourceInfo
					sources={[SOURCES.espnStats]}
					note="No data is shown yet. Category rankings will be z-scores calculated from ESPN per-game averages."
				/>
			</div>
			<p className="max-w-md text-sm text-muted-foreground">
				Z-score rankings across the standard nine categories, with season and last 7/14/30-day
				windows.
			</p>
			<div className="flex flex-wrap justify-center gap-1.5">
				{PLANNED_COLUMNS.map((c) => (
					<span key={c} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
						{c}
					</span>
				))}
			</div>
		</section>
	);
}
