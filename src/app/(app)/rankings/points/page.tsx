import { Suspense } from "react";
import { getPlayers, getPlayersMeta } from "@/lib/data/players";
import { DataSourceInfo } from "@/components/data-source-info";
import { SOURCES } from "@/lib/data/data-sources";
import { toRankingsRow } from "@/lib/data/rankings";
import { fantasyPoints, POINTS_PRESETS, type PointsPreset } from "@/lib/data/scoring";
import { RankingsTable, type RankingsColumn } from "@/components/rankings/rankings-table";
import { RankingsFilter } from "@/components/rankings/rankings-filter";
import { formatUpdated } from "@/lib/data/format";

export const metadata = { title: "Points League Rankings · Backboard" };

const MIN_GAMES = 10;

const COLUMNS: RankingsColumn[] = [
	{ key: "fpg", label: "FP/G", format: "dec1", heat: true },
	{ key: "fp", label: "Total FP", format: "int", desktopOnly: true },
	{ key: "gp", label: "GP", format: "int" },
	{ key: "min", label: "MPG", format: "dec1", desktopOnly: true },
	{ key: "pts", label: "PTS", format: "dec1", heat: true, desktopOnly: true },
	{ key: "reb", label: "REB", format: "dec1", heat: true, desktopOnly: true },
	{ key: "ast", label: "AST", format: "dec1", heat: true, desktopOnly: true },
	{ key: "stl", label: "STL", format: "dec1", heat: true, desktopOnly: true },
	{ key: "blk", label: "BLK", format: "dec1", heat: true, desktopOnly: true },
	{ key: "tov", label: "TO", format: "dec1", heat: true, invert: true, desktopOnly: true },
];

type PageProps = { searchParams: Promise<{ scoring?: string }> };

export default async function PointsRankingsPage({ searchParams }: PageProps) {
	const { scoring } = await searchParams;
	const preset: PointsPreset = scoring === "espn" ? "espn" : "yahoo";

	const rows = getPlayers()
		.filter((p) => p.stats && p.stats.gp >= MIN_GAMES)
		.map((p) => {
			const s = p.stats!;
			const fpg = fantasyPoints(s, preset);
			return { p, fpg, s };
		})
		.sort((a, b) => b.fpg - a.fpg)
		.map(({ p, fpg, s }) =>
			toRankingsRow(p, {
				fpg,
				fp: fpg * s.gp,
				gp: s.gp,
				min: s.min,
				pts: s.pts,
				reb: s.reb,
				ast: s.ast,
				stl: s.stl,
				blk: s.blk,
				tov: s.tov,
			}),
		);

	return (
		<section className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-1.5">
					<p className="text-sm text-muted-foreground">
						Ranked by fantasy points per game · min {MIN_GAMES} GP
					</p>
					<DataSourceInfo
						sources={[SOURCES.espnRosters, SOURCES.espnStats, SOURCES.nbaImages, SOURCES.espnImages]}
						updated={formatUpdated(getPlayersMeta().fetchedAt)}
						note={`Fantasy points use ${POINTS_PRESETS[preset].label} default scoring applied to ${getPlayersMeta().statsSeason} averages. Players with fewer than ${MIN_GAMES} games are hidden.`}
					/>
				</div>
				<Suspense>
					<RankingsFilter
						param="scoring"
						defaultValue="yahoo"
						options={Object.entries(POINTS_PRESETS).map(([value, { label }]) => ({ value, label }))}
					/>
				</Suspense>
			</div>
			<RankingsTable key={preset} columns={COLUMNS} rows={rows} defaultSortKey="fpg" />
		</section>
	);
}
