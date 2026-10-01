"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import { cn } from "@/lib/utils";

export type RankingsColumn = {
	key: string;
	label: string;
	format?: "int" | "dec1" | "dec2" | "pct" | "text";
	/** Highlight outliers (elite / poor) in this column. */
	heat?: boolean;
	/** Lower is better (e.g. turnovers) — flips heat and default sort direction. */
	invert?: boolean;
	/** Hide below the md breakpoint. */
	desktopOnly?: boolean;
};

export type RankingsRow = {
	id: string;
	name: string;
	imageUrl: string | null;
	teamId: string | null;
	tricode: string | null;
	position: string | null;
	badge?: string | null;
	values: Record<string, number | string | null>;
};

type RankingsTableProps = {
	columns: RankingsColumn[];
	rows: RankingsRow[];
	/** Column rows arrive sorted by; rank is recomputed from this order. */
	defaultSortKey: string;
	emptyMessage?: string;
};

function formatValue(value: number | string | null, format: RankingsColumn["format"]) {
	if (value == null) return "–";
	if (typeof value === "string" || format === "text") return String(value);
	switch (format) {
		case "int":
			return Math.round(value).toString();
		case "dec2":
			return value.toFixed(2);
		case "pct":
			return value.toFixed(3).replace(/^0/, "");
		default:
			return value.toFixed(1);
	}
}

/** Shading starts at |z| = HEAT_START and reaches full strength at HEAT_FULL. */
const HEAT_START = 1.5;
const HEAT_FULL = 3;
const HEAT_MAX_ALPHA = 0.45;
const GOOD_RGB = "16 185 129"; // emerald-500
const BAD_RGB = "244 63 94"; // rose-500

/**
 * Background for a value given its column's mean/std. Values within
 * HEAT_START standard deviations of the average stay transparent; only
 * outliers are tinted, more strongly the further out they are.
 */
function heatStyle(z: number) {
	const strength = Math.min(1, Math.max(0, (Math.abs(z) - HEAT_START) / (HEAT_FULL - HEAT_START)));
	if (Math.abs(z) < HEAT_START) return undefined;
	const alpha = 0.12 + strength * (HEAT_MAX_ALPHA - 0.12);
	return { backgroundColor: `rgb(${z > 0 ? GOOD_RGB : BAD_RGB} / ${alpha.toFixed(2)})` };
}

export function RankingsTable({ columns, rows, defaultSortKey, emptyMessage }: RankingsTableProps) {
	const [sortKey, setSortKey] = useState(defaultSortKey);
	const [sortDesc, setSortDesc] = useState(true);

	const ranks = useMemo(() => new Map(rows.map((r, i) => [r.id, i + 1])), [rows]);

	const sorted = useMemo(() => {
		if (sortKey === defaultSortKey && sortDesc) return rows;
		const dir = sortDesc ? -1 : 1;
		return [...rows].sort((a, b) => {
			const av = a.values[sortKey];
			const bv = b.values[sortKey];
			if (av == null) return 1;
			if (bv == null) return -1;
			if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
			return String(av).localeCompare(String(bv)) * dir;
		});
	}, [rows, sortKey, sortDesc, defaultSortKey]);

	// Mean and standard deviation per heat column, across all listed players.
	const stats = useMemo(() => {
		const out: Record<string, { mean: number; std: number }> = {};
		for (const col of columns) {
			if (!col.heat) continue;
			const nums = rows.map((r) => r.values[col.key]).filter((v): v is number => typeof v === "number");
			if (nums.length < 2) continue;
			const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
			const std = Math.sqrt(nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length);
			if (std > 0) out[col.key] = { mean, std };
		}
		return out;
	}, [columns, rows]);

	function onSort(col: RankingsColumn) {
		if (col.key === sortKey) setSortDesc((d) => !d);
		else {
			setSortKey(col.key);
			setSortDesc(!col.invert && col.format !== "text");
		}
	}

	if (rows.length === 0) {
		return <p className="py-16 text-center text-sm text-muted-foreground">{emptyMessage ?? "No players match."}</p>;
	}

	const SortIcon = sortDesc ? ArrowDown : ArrowUp;

	return (
		<div className="flex flex-col gap-2">
			<div className="w-full overflow-x-auto rounded-xl border bg-background">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b bg-muted text-[11px] uppercase tracking-wide text-muted-foreground">
							<th className="sticky left-0 z-20 bg-muted py-2 pr-1 pl-1.5 text-left font-medium sm:px-2 md:px-3">
								<span className="inline-block w-5 text-center sm:w-6">#</span>
								<span className="ml-1.5 sm:ml-2">Player</span>
							</th>
							{columns.map((col) => (
								<th
									key={col.key}
									className={cn(
										"px-1 py-2 text-right font-medium whitespace-nowrap last:pr-2 md:px-1.5 md:last:pr-3",
										col.desktopOnly && "hidden md:table-cell",
									)}
								>
									<button
										type="button"
										onClick={() => onSort(col)}
										className={cn(
											"inline-flex items-center justify-end gap-0.5 px-1.5 uppercase hover:text-foreground",
											col.key === sortKey && "text-foreground",
										)}
									>
										{col.key === sortKey && <SortIcon className="size-3" />}
										{col.label}
									</button>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sorted.map((row) => (
							<tr
								key={row.id}
								className="group border-b border-border/60 last:border-0"
							>
								<td className="sticky left-0 z-10 max-w-[60vw] bg-background py-1 pr-1 pl-1.5 sm:max-w-none sm:px-2 md:min-w-64 md:px-3">
									<div className="flex items-center gap-1.5 sm:gap-2">
										<span className="w-5 shrink-0 text-center text-xs sm:w-6 tabular-nums text-muted-foreground">
											{ranks.get(row.id)}
										</span>
										<div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-muted/60 py-1 pr-2 pl-1 transition-colors group-hover:bg-muted">
											<div className="relative size-7 shrink-0 overflow-hidden rounded-full sm:size-8 bg-background ring-1 ring-border/60">
												{row.imageUrl && (
													<Image
														src={row.imageUrl}
														alt=""
														fill
														sizes="32px"
														unoptimized
														className="object-cover object-top"
													/>
												)}
											</div>
											<div className="flex min-w-0 flex-col leading-tight">
												<span className="flex min-w-0 items-center gap-1.5">
													<span className="truncate font-medium">{row.name}</span>
													{row.badge && (
														<span className="shrink-0 rounded bg-primary/10 px-1 text-[10px] font-semibold uppercase text-primary">
															{row.badge}
														</span>
													)}
												</span>
												<span className="flex items-center gap-1 text-xs text-muted-foreground">
													{row.teamId && <TeamLogo teamId={row.teamId} size={12} />}
													{row.tricode ?? "FA"}
													{row.position && <span>· {row.position}</span>}
												</span>
											</div>
										</div>
									</div>
								</td>
								{columns.map((col) => {
									const value = row.values[col.key];
									const s = stats[col.key];
									const z =
										col.heat && s && typeof value === "number"
											? ((col.invert ? -1 : 1) * (value - s.mean)) / s.std
											: 0;
									const style = heatStyle(z);
									return (
										<td
											key={col.key}
											className={cn(
												"px-1 py-1 text-right last:pr-2 md:px-1.5 md:last:pr-3",
												col.desktopOnly && "hidden md:table-cell",
											)}
										>
											<span
												style={style}
												className={cn(
													"inline-block min-w-11 rounded-md px-1.5 py-1 tabular-nums",
													col.key === sortKey && "font-semibold",
													Math.abs(z) >= HEAT_FULL - 0.5 && "font-semibold",
													value == null && "text-muted-foreground",
												)}
											>
												{formatValue(value, col.format)}
											</span>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{Object.keys(stats).length > 0 && (
				<p className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-sm" style={{ backgroundColor: `rgb(${GOOD_RGB} / 0.45)` }} />
						Elite
					</span>
					<span className="flex items-center gap-1.5">
						<span className="size-2.5 rounded-sm" style={{ backgroundColor: `rgb(${BAD_RGB} / 0.45)` }} />
						Poor
					</span>
					<span>Shaded when a value is 1.5+ standard deviations from the average of listed players.</span>
				</p>
			)}
		</div>
	);
}
