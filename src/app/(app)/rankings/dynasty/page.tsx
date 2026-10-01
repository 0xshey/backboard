import { Suspense } from "react";
import { getPlayers, getPlayersMeta } from "@/lib/data/players";
import { DataSourceInfo } from "@/components/data-source-info";
import { SOURCES } from "@/lib/data/data-sources";
import { formatUpdated } from "@/lib/data/format";
import { toRankingsRow } from "@/lib/data/rankings";
import { dynastyScore, fantasyPoints } from "@/lib/data/scoring";
import { RankingsTable, type RankingsColumn } from "@/components/rankings/rankings-table";
import { RankingsFilter } from "@/components/rankings/rankings-filter";

export const metadata = { title: "Dynasty Rankings · Backboard" };

const COLUMNS: RankingsColumn[] = [
	{ key: "value", label: "Value", format: "dec1", heat: true },
	{ key: "age", label: "Age", format: "int" },
	{ key: "draft", label: "Draft", format: "text", desktopOnly: true },
	{ key: "exp", label: "Exp", format: "int", desktopOnly: true },
	{ key: "fpg", label: "FP/G", format: "dec1", heat: true, desktopOnly: true },
	{ key: "gp", label: "GP", format: "int", desktopOnly: true },
];

type PageProps = { searchParams: Promise<{ view?: string }> };

export default async function DynastyRankingsPage({ searchParams }: PageProps) {
	const { view } = await searchParams;
	const rookiesOnly = view === "rookies";

	const rows = getPlayers()
		.filter((p) => (rookiesOnly ? p.isRookie : p.stats && p.stats.gp >= 10))
		.map((p) => {
			const fpg = p.stats ? fantasyPoints(p.stats) : null;
			// Rookies have no NBA stats yet: rank by draft slot until they play.
			const value = fpg != null ? dynastyScore(fpg, p.age) : p.draftPick ? 100 - p.draftPick - (p.draftRound === 2 ? 30 : 0) : 0;
			return { p, fpg, value };
		})
		.sort((a, b) => b.value - a.value)
		.map(({ p, fpg, value }) => ({
			...toRankingsRow(p, {
				value: rookiesOnly && fpg == null ? null : value,
				age: p.age,
				draft: p.draftYear ? `${p.draftYear} R${p.draftRound} #${p.draftPick}` : rookiesOnly ? "Undrafted" : null,
				exp: p.experience,
				fpg,
				gp: p.stats?.gp ?? null,
			}),
			// Every row is a rookie in the Rookies view; the badge would be noise.
			...(rookiesOnly && { badge: null }),
		}));

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-1.5">
					<p className="text-sm text-muted-foreground">
						{rookiesOnly
							? "2026-27 rookies, ordered by draft position"
							: "Per-game production weighted by age · min 10 GP"}
					</p>
					<DataSourceInfo
						sources={[SOURCES.espnRosters, SOURCES.espnStats, SOURCES.espnDraft, SOURCES.nbaImages, SOURCES.espnImages]}
						updated={formatUpdated(getPlayersMeta().fetchedAt)}
						note="Value is Yahoo fantasy points per game scaled by an age curve (younger players are boosted, 30+ discounted). Rookies without NBA games are ordered by draft slot. This is an early model, not a projection."
					/>
				</div>
				<Suspense>
					<RankingsFilter
						param="view"
						defaultValue="all"
						options={[
							{ value: "all", label: "All players" },
							{ value: "rookies", label: "Rookies" },
						]}
					/>
				</Suspense>
			</div>
			<RankingsTable
				key={rookiesOnly ? "rookies" : "all"}
				columns={COLUMNS}
				rows={rows}
				defaultSortKey="value"
				emptyMessage="No rookies found."
			/>
		</section>
	);
}
