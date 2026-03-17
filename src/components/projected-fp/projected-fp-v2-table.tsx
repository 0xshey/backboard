"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, TrendingUp, ChevronsUpDown, ChevronUp } from "lucide-react";
import { valueToRGB, getContrastingColor } from "@/lib/value-to-color";
import { teamLogoURL } from "@/lib/image-urls";
import { cn } from "@/lib/utils";
import type { GameSectionV2 } from "@/app/(app)/demo/projected-fp-v2/projected-fp-v2-content";
import type { ProjectionResult } from "@/lib/projected-fp";

interface Props {
	gameSections: GameSectionV2[];
	hasCompletedGames: boolean;
	mae: number | null;
	completedCount: number;
	absorptionRate: number;
	injuryCount: number;
}

export function ProjectedFPV2Table({
	gameSections,
	hasCompletedGames,
	mae,
	completedCount,
	absorptionRate,
	injuryCount,
}: Props) {
	const boostedCount = gameSections
		.flatMap((s) => s.projections)
		.filter((p) => p.components.injuryBoostFactor > 1.001).length;

	return (
		<div className="flex flex-col gap-8">
			{/* Formula & accuracy summary */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{mae !== null && completedCount > 0 && (
					<div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex flex-col gap-1">
						<p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
							Formula Accuracy
						</p>
						<div className="flex items-baseline gap-3">
							<span className="text-2xl font-semibold tabular-nums">
								±{mae.toFixed(1)}
							</span>
							<span className="text-sm text-muted-foreground">
								MAE across {completedCount} players
							</span>
						</div>
					</div>
				)}

				<div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex flex-col gap-1">
					<p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
						Injury Context
					</p>
					<div className="flex items-baseline gap-3">
						<span className="text-2xl font-semibold tabular-nums">
							{injuryCount}
						</span>
						<span className="text-sm text-muted-foreground">
							injured/questionable players found
						</span>
					</div>
					{boostedCount > 0 && (
						<p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
							{boostedCount} players receiving a boost at{" "}
							{Math.round(absorptionRate * 100)}% absorption
						</p>
					)}
				</div>
			</div>

			{/* Formula note */}
			<div className="rounded-xl border border-border/50 bg-muted/20 px-5 py-4 flex flex-col gap-3">
				<p className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
					Injury Boost Formula
				</p>
				<div className="font-mono text-xs space-y-1.5">
					<div>
						<span className="text-foreground font-semibold">
							INJURY = 1 + clamp(displaced_fp / active_team_fp, 0,
							0.5) × absorption_rate
						</span>
					</div>
					<div className="text-muted-foreground space-y-0.5">
						<div>
							displaced_fp = Σ(p_out × seasonAvgFP) for injured
							teammates
						</div>
						<div>
							active_team_fp = total team FP pool − displaced_fp
						</div>
						<div>
							p_out: Out=1.0 · Doubtful=0.8 · Questionable=0.4 ·
							Probable=0.1
						</div>
					</div>
				</div>
			</div>

			<FlatTable
				gameSections={gameSections}
				hasCompletedGames={hasCompletedGames}
			/>
		</div>
	);
}

// ── Flat sortable table ──────────────────────────────────────────────────────

type SortKey =
	| "name"
	| "avg"
	| "base"
	| "inj"
	| "proj"
	| "delta"
	| "conf"
	| "actual"
	| "error";

interface FlatRow {
	proj: ProjectionResult;
	injuryStatus?: string;
	gameLabel: string;
}

function FlatTable({
	gameSections,
	hasCompletedGames,
}: {
	gameSections: GameSectionV2[];
	hasCompletedGames: boolean;
}) {
	const [sortKey, setSortKey] = useState<SortKey>("proj");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const toggle = (id: string) =>
		setExpandedId((prev) => (prev === id ? null : id));

	function handleSort(key: SortKey) {
		if (sortKey === key) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir(key === "name" ? "asc" : "desc");
		}
	}

	// Flatten all games into rows
	const rows: FlatRow[] = gameSections.flatMap(
		({ game, projections, playerInjuryStatuses }) => {
			const home = (game as any).home_team;
			const away = (game as any).away_team;
			const gameLabel =
				home && away
					? `${away.tricode ?? away.name} @ ${home.tricode ?? home.name}`
					: "";
			return projections.map((proj) => ({
				proj,
				injuryStatus: playerInjuryStatuses[proj.playerId],
				gameLabel,
			}));
		},
	);

	// Sort
	const sorted = [...rows].sort((a, b) => {
		const aOut = a.injuryStatus === "Out";
		const bOut = b.injuryStatus === "Out";
		// Always push Out players to the bottom regardless of sort
		if (aOut !== bOut) return aOut ? 1 : -1;

		let av: number | string = 0;
		let bv: number | string = 0;
		switch (sortKey) {
			case "name":
				av = `${a.proj.firstName} ${a.proj.lastName}`;
				bv = `${b.proj.firstName} ${b.proj.lastName}`;
				break;
			case "avg":
				av = a.proj.seasonAvgFP;
				bv = b.proj.seasonAvgFP;
				break;
			case "base":
				av = a.proj.projectedFPBase;
				bv = b.proj.projectedFPBase;
				break;
			case "inj":
				av = a.proj.components.injuryBoostFactor;
				bv = b.proj.components.injuryBoostFactor;
				break;
			case "proj":
				av = a.proj.projectedFP;
				bv = b.proj.projectedFP;
				break;
			case "delta":
				av = a.proj.projectedFP - a.proj.seasonAvgFP;
				bv = b.proj.projectedFP - b.proj.seasonAvgFP;
				break;
			case "conf":
				av = a.proj.confidence;
				bv = b.proj.confidence;
				break;
			case "actual":
				av = a.proj.actualFP ?? -Infinity;
				bv = b.proj.actualFP ?? -Infinity;
				break;
			case "error":
				av = a.proj.error != null ? Math.abs(a.proj.error) : Infinity;
				bv = b.proj.error != null ? Math.abs(b.proj.error) : Infinity;
				break;
		}
		if (typeof av === "string" && typeof bv === "string") {
			return sortDir === "asc"
				? av.localeCompare(bv)
				: bv.localeCompare(av);
		}
		return sortDir === "asc"
			? (av as number) - (bv as number)
			: (bv as number) - (av as number);
	});

	const colCount = hasCompletedGames ? 11 : 9;

	function SortHeader({
		label,
		col,
		align = "right",
	}: {
		label: string;
		col: SortKey;
		align?: "left" | "right" | "center";
	}) {
		const active = sortKey === col;
		return (
			<th
				className={cn(
					"px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors",
					align === "right" && "text-right",
					align === "left" && "text-left",
					align === "center" && "text-center",
					active && "text-foreground",
				)}
				onClick={() => handleSort(col)}
			>
				<span className="inline-flex items-center gap-1 justify-end">
					{label}
					{active ? (
						sortDir === "desc" ? (
							<ChevronDown className="w-3 h-3 shrink-0" />
						) : (
							<ChevronUp className="w-3 h-3 shrink-0" />
						)
					) : (
						<ChevronsUpDown className="w-3 h-3 shrink-0 opacity-30" />
					)}
				</span>
			</th>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border">
			<table className="w-full text-sm border-collapse">
				<thead>
					<tr className="border-b border-border bg-muted/30">
						<SortHeader label="Player" col="name" align="left" />
						<th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
							Game
						</th>
						<SortHeader label="AVG" col="avg" />
						<SortHeader label="Base" col="base" />
						<SortHeader label="INJ" col="inj" />
						<SortHeader label="PROJ" col="proj" />
						<SortHeader label="Δ" col="delta" />
						<SortHeader label="Conf" col="conf" align="center" />
						{hasCompletedGames && (
							<>
								<SortHeader label="Actual" col="actual" />
								<SortHeader label="Err" col="error" />
							</>
						)}
						<th className="w-8" />
					</tr>
				</thead>
				<tbody>
					{sorted.map(({ proj, injuryStatus, gameLabel }) => (
						<FlatPlayerRow
							key={proj.playerId}
							proj={proj}
							injuryStatus={injuryStatus}
							gameLabel={gameLabel}
							hasCompletedGames={hasCompletedGames}
							isExpanded={expandedId === proj.playerId}
							onToggle={() => toggle(proj.playerId)}
							colCount={colCount}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

function FlatPlayerRow({
	proj,
	injuryStatus,
	gameLabel,
	hasCompletedGames,
	isExpanded,
	onToggle,
	colCount,
}: {
	proj: ProjectionResult;
	injuryStatus?: string;
	gameLabel: string;
	hasCompletedGames: boolean;
	isExpanded: boolean;
	onToggle: () => void;
	colCount: number;
}) {
	const isOut = injuryStatus === "Out";
	const delta = proj.projectedFP - proj.seasonAvgFP;
	const hasBoost = !isOut && proj.components.injuryBoostFactor > 1.001;

	const projBg = valueToRGB({ value: proj.projectedFP, schema: "fantasyPoints" });
	const projColor = getContrastingColor(projBg);
	const baseBg = valueToRGB({ value: proj.projectedFPBase, schema: "fantasyPoints" });
	const baseColor = getContrastingColor(baseBg);
	const deltaColor = valueToRGB({
		value: delta,
		min: -20,
		max: 20,
		midColor: [160, 160, 160, 1],
	});

	return (
		<>
			<tr
				className={cn(
					"border-b border-border/50 transition-colors",
					isOut
						? "opacity-40 bg-muted/10"
						: "hover:bg-muted/20 cursor-pointer",
					!isOut && hasBoost && "bg-emerald-500/5",
				)}
				onClick={isOut ? undefined : onToggle}
			>
				{/* Player */}
				<td className="px-3 py-2">
					<div className="flex items-center gap-2">
						<Image
							src={teamLogoURL(proj.teamId)}
							alt=""
							width={18}
							height={18}
							quality={100}
							className="opacity-60 shrink-0"
						/>
						<Link
							href={`/player/${proj.playerId}`}
							className="hover:opacity-70 transition-opacity whitespace-nowrap"
							onClick={(e) => e.stopPropagation()}
						>
							<span className="text-muted-foreground text-xs">
								{proj.firstName}{" "}
							</span>
							<span className={cn("font-medium", isOut && "line-through")}>
								{proj.lastName}
							</span>
						</Link>
						{isOut && (
							<span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
								Out
							</span>
						)}
						{!isOut && injuryStatus && injuryStatus !== "Available" && (
							<StatusBadge status={injuryStatus} />
						)}
						{hasBoost && (
							<TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
						)}
					</div>
				</td>

				{/* Game */}
				<td className="px-3 py-2">
					<span className="text-xs text-muted-foreground whitespace-nowrap">
						{gameLabel}
					</span>
				</td>

				{/* AVG */}
				<td className="px-3 py-2 text-right">
					<span className="tabular-nums text-muted-foreground">
						{proj.seasonAvgFP.toFixed(1)}
					</span>
				</td>

				{/* BASE */}
				<td className="px-2 py-1.5 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<div
							className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-12 opacity-60"
							style={{ backgroundColor: baseBg, color: baseColor }}
						>
							<span className="tabular-nums text-xs">
								{proj.projectedFPBase.toFixed(1)}
							</span>
						</div>
					)}
				</td>

				{/* INJ */}
				<td className="px-3 py-2 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : hasBoost ? (
						<span className="text-xs font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
							{proj.components.injuryBoostFactor.toFixed(3)}×
						</span>
					) : (
						<span className="text-xs text-muted-foreground/40">—</span>
					)}
				</td>

				{/* PROJ */}
				<td className="px-2 py-1.5 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<div
							className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-14"
							style={{ backgroundColor: projBg, color: projColor }}
						>
							<span className="font-semibold tabular-nums">
								{proj.projectedFP.toFixed(1)}
							</span>
						</div>
					)}
				</td>

				{/* Δ */}
				<td className="px-3 py-2 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<span
							className="font-medium tabular-nums text-xs"
							style={{ color: deltaColor }}
						>
							{delta >= 0 ? "+" : ""}
							{delta.toFixed(1)}
						</span>
					)}
				</td>

				{/* Conf */}
				<td className="px-3 py-2 text-center">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<ConfidenceBadge label={proj.confidenceLabel} />
					)}
				</td>

				{hasCompletedGames && (
					<>
						<td className="px-2 py-1.5 text-right">
							{proj.actualFP != null ? (
								<div
									className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-14"
									style={{
										backgroundColor: valueToRGB({
											value: proj.actualFP,
											schema: "fantasyPoints",
										}),
										color: getContrastingColor(
											valueToRGB({
												value: proj.actualFP,
												schema: "fantasyPoints",
											}),
										),
									}}
								>
									<span className="font-semibold tabular-nums">
										{proj.actualFP.toFixed(1)}
									</span>
								</div>
							) : (
								<span className="text-muted-foreground text-xs">—</span>
							)}
						</td>
						<td className="px-3 py-2 text-right">
							{proj.error != null ? (
								<span
									className="font-medium tabular-nums text-xs"
									style={{
										color: valueToRGB({
											value: -Math.abs(proj.error),
											min: -25,
											max: 0,
											lowColor: [192, 11, 35, 1],
											midColor: [160, 160, 160, 1],
											highColor: [43, 168, 74, 1],
										}),
									}}
								>
									{proj.error >= 0 ? "+" : ""}
									{proj.error.toFixed(1)}
								</span>
							) : (
								<span className="text-muted-foreground text-xs">—</span>
							)}
						</td>
					</>
				)}

				{/* Expand */}
				<td className="px-2 py-2 text-center">
					{!isOut && (
						isExpanded ? (
							<ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
						) : (
							<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
						)
					)}
				</td>
			</tr>

			{!isOut && isExpanded && (
				<tr className="border-b border-border/50 bg-muted/10">
					<td colSpan={colCount} className="px-4 py-4">
						<FormulaBreakdown proj={proj} />
					</td>
				</tr>
			)}
		</>
	);
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		Out: "bg-red-500/15 text-red-600 dark:text-red-400",
		Doubtful: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
		Questionable:
			"bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
		Probable: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
	};
	return (
		<span
			className={cn(
				"inline-block text-xs font-medium px-1.5 py-0.5 rounded",
				colors[status] ?? "bg-muted text-muted-foreground",
			)}
		>
			{status}
		</span>
	);
}

function PlayerRows({
	proj,
	injuryStatus,
	hasCompletedGames,
	isExpanded,
	onToggle,
	colCount,
}: {
	proj: ProjectionResult;
	injuryStatus?: string;
	hasCompletedGames: boolean;
	isExpanded: boolean;
	onToggle: () => void;
	colCount: number;
}) {
	const isOut = injuryStatus === "Out";
	const delta = proj.projectedFP - proj.seasonAvgFP;
	const hasBoost = !isOut && proj.components.injuryBoostFactor > 1.001;
	const projBg = valueToRGB({
		value: proj.projectedFP,
		schema: "fantasyPoints",
	});
	const projColor = getContrastingColor(projBg);
	const baseBg = valueToRGB({
		value: proj.projectedFPBase,
		schema: "fantasyPoints",
	});
	const baseColor = getContrastingColor(baseBg);
	const deltaColor = valueToRGB({
		value: delta,
		min: -20,
		max: 20,
		midColor: [160, 160, 160, 1],
	});

	return (
		<>
			<tr
				className={cn(
					"border-b border-border/50 transition-colors",
					isOut
						? "opacity-40 bg-muted/10"
						: "hover:bg-muted/20 cursor-pointer",
					!isOut && hasBoost && "bg-emerald-500/5",
				)}
				onClick={isOut ? undefined : onToggle}
			>
				{/* Player */}
				<td className="px-3 py-2">
					<div className="flex items-center gap-2">
						<Image
							src={teamLogoURL(proj.teamId)}
							alt=""
							width={18}
							height={18}
							quality={100}
							className="opacity-60 shrink-0"
						/>
						<Link
							href={`/player/${proj.playerId}`}
							className="hover:opacity-70 transition-opacity"
							onClick={(e) => e.stopPropagation()}
						>
							<span className="text-muted-foreground text-xs">
								{proj.firstName}{" "}
							</span>
							<span className={cn("font-medium", isOut && "line-through")}>
								{proj.lastName}
							</span>
						</Link>
						{isOut && (
							<span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 shrink-0">
								Out
							</span>
						)}
						{!isOut && injuryStatus && injuryStatus !== "Available" && (
							<StatusBadge status={injuryStatus} />
						)}
						{hasBoost && (
							<TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
						)}
					</div>
				</td>

				{/* Season AVG */}
				<td className="px-3 py-2 text-right">
					<span className="tabular-nums text-muted-foreground">
						{proj.seasonAvgFP.toFixed(1)}
					</span>
				</td>

				{/* BASE (no injury) */}
				<td className="px-2 py-1.5 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<div
							className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-12 opacity-60"
							style={{ backgroundColor: baseBg, color: baseColor }}
						>
							<span className="tabular-nums text-xs">
								{proj.projectedFPBase.toFixed(1)}
							</span>
						</div>
					)}
				</td>

				{/* INJ multiplier */}
				<td className="px-3 py-2 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : hasBoost ? (
						<span className="text-xs font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
							{proj.components.injuryBoostFactor.toFixed(3)}×
						</span>
					) : (
						<span className="text-xs text-muted-foreground/40">
							—
						</span>
					)}
				</td>

				{/* PROJ FP */}
				<td className="px-2 py-1.5 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<div
							className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-14"
							style={{ backgroundColor: projBg, color: projColor }}
						>
							<span className="font-semibold tabular-nums">
								{proj.projectedFP.toFixed(1)}
							</span>
						</div>
					)}
				</td>

				{/* Delta */}
				<td className="px-3 py-2 text-right">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<span
							className="font-medium tabular-nums text-xs"
							style={{ color: deltaColor }}
						>
							{delta >= 0 ? "+" : ""}
							{delta.toFixed(1)}
						</span>
					)}
				</td>

				{/* Confidence */}
				<td className="px-3 py-2 text-center">
					{isOut ? (
						<span className="text-muted-foreground text-xs">—</span>
					) : (
						<ConfidenceBadge label={proj.confidenceLabel} />
					)}
				</td>

				{/* Actual + Error */}
				{hasCompletedGames && (
					<>
						<td className="px-2 py-1.5 text-right">
							{proj.actualFP != null ? (
								<div
									className="inline-flex items-center justify-end px-2 py-1 rounded-md min-w-14"
									style={{
										backgroundColor: valueToRGB({
											value: proj.actualFP,
											schema: "fantasyPoints",
										}),
										color: getContrastingColor(
											valueToRGB({
												value: proj.actualFP,
												schema: "fantasyPoints",
											}),
										),
									}}
								>
									<span className="font-semibold tabular-nums">
										{proj.actualFP.toFixed(1)}
									</span>
								</div>
							) : (
								<span className="text-muted-foreground text-xs">
									—
								</span>
							)}
						</td>
						<td className="px-3 py-2 text-right">
							{proj.error != null ? (
								<span
									className="font-medium tabular-nums text-xs"
									style={{
										color: valueToRGB({
											value: -Math.abs(proj.error),
											min: -25,
											max: 0,
											lowColor: [192, 11, 35, 1],
											midColor: [160, 160, 160, 1],
											highColor: [43, 168, 74, 1],
										}),
									}}
								>
									{proj.error >= 0 ? "+" : ""}
									{proj.error.toFixed(1)}
								</span>
							) : (
								<span className="text-muted-foreground text-xs">
									—
								</span>
							)}
						</td>
					</>
				)}

				{/* Expand toggle */}
				<td className="px-2 py-2 text-center">
					{!isOut && (
						isExpanded ? (
							<ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
						) : (
							<ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
						)
					)}
				</td>
			</tr>

			{/* Breakdown row */}
			{!isOut && isExpanded && (
				<tr className="border-b border-border/50 bg-muted/10">
					<td colSpan={colCount} className="px-4 py-4">
						<FormulaBreakdown proj={proj} />
					</td>
				</tr>
			)}
		</>
	);
}

function ConfidenceBadge({ label }: { label: "Low" | "Medium" | "High" }) {
	return (
		<span
			className={cn(
				"inline-block text-xs font-medium px-2 py-0.5 rounded-full",
				label === "High" &&
					"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
				label === "Medium" &&
					"bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
				label === "Low" && "bg-red-500/15 text-red-600 dark:text-red-400",
			)}
		>
			{label}
		</span>
	);
}

function FormulaBreakdown({ proj }: { proj: ProjectionResult }) {
	const c = proj.components;
	const hasBoost = c.injuryBoostFactor > 1.001;

	const baseWeightDesc =
		c.avgL10 != null && c.avgL5 != null
			? `0.35 × ${c.avgSeason.toFixed(1)} + 0.40 × ${c.avgL10.toFixed(1)} + 0.25 × ${c.avgL5.toFixed(1)}`
			: c.avgL10 != null
				? `0.45 × ${c.avgSeason.toFixed(1)} + 0.55 × ${c.avgL10.toFixed(1)}`
				: `${c.avgSeason.toFixed(1)} (season avg only)`;

	const oppLabel =
		c.oppDefFactor > 1.05
			? "soft defense — allows more FP than average"
			: c.oppDefFactor < 0.95
				? "stout defense — allows fewer FP than average"
				: "average defense";

	const haLabel =
		c.homeAwaySource === "historical"
			? `${c.isHome ? "home" : "away"} (${c.isHome ? c.homeGamesCount : c.awayGamesCount} games, historical)`
			: `${c.isHome ? "home" : "away"} (static league avg)`;

	const paceLabel =
		c.oppQualityFactor > 1.02
			? "fast-paced opponent"
			: c.oppQualityFactor < 0.98
				? "slow-paced opponent"
				: "average pace opponent";

	// Build injury note
	let injuryNote = "no injury context";
	if (hasBoost && c.injuredTeammates.length > 0) {
		const names = c.injuredTeammates
			.map((t) => `${t.name} (${t.status}, ${t.seasonAvgFP.toFixed(1)} FP)`)
			.join(", ");
		const rawPct = (c.displacedFPRatio * 100).toFixed(1);
		injuryNote = `${names} — ${rawPct}% usage vacuum`;
	}

	const rows = [
		{
			label: "BASE",
			formula: baseWeightDesc,
			value: c.baseAvg.toFixed(1),
			note: c.avgL5 != null
				? `L5: ${c.l5GamesCount} games`
				: "L5 insufficient (<3 games)",
		},
		{
			label: "OPP DEF",
			formula: `${c.oppDefFactor.toFixed(3)}×`,
			value: null,
			note: oppLabel,
		},
		{
			label: "HOME/AWAY",
			formula: `${c.homeAwayFactor.toFixed(3)}×`,
			value: null,
			note: haLabel,
		},
		{
			label: "PACE",
			formula: `${c.oppQualityFactor.toFixed(3)}×`,
			value: null,
			note: paceLabel,
		},
		{
			label: "INJURY",
			formula: `${c.injuryBoostFactor.toFixed(3)}×`,
			value: null,
			note: injuryNote,
			highlight: hasBoost,
		},
	];

	const finalFormula = `${c.baseAvg.toFixed(1)} × ${c.oppDefFactor.toFixed(3)} × ${c.homeAwayFactor.toFixed(3)} × ${c.oppQualityFactor.toFixed(3)}${hasBoost ? ` × ${c.injuryBoostFactor.toFixed(3)}` : ""}`;

	return (
		<div className="flex flex-col gap-3">
			<div className="grid grid-cols-1 gap-1.5">
				{rows.map((row) => (
					<div key={row.label} className="flex items-start gap-3 text-xs">
						<span
							className={cn(
								"font-mono w-20 shrink-0 pt-px",
								row.highlight
									? "text-emerald-600 dark:text-emerald-400"
									: "text-muted-foreground/60",
							)}
						>
							{row.label}
						</span>
						<span
							className={cn(
								"font-mono font-medium",
								row.highlight
									? "text-emerald-600 dark:text-emerald-400"
									: "text-foreground",
							)}
						>
							{row.formula}
						</span>
						{row.value && (
							<span className="text-muted-foreground">
								= {row.value}
							</span>
						)}
						<span className="text-muted-foreground/60 ml-1">
							{row.note}
						</span>
					</div>
				))}
			</div>

			<div className="border-t border-border/50 pt-3 flex items-center gap-2 text-xs font-mono flex-wrap">
				<span className="text-muted-foreground">{finalFormula}</span>
				<span className="text-muted-foreground">=</span>
				<span
					className="font-bold text-sm px-2 py-0.5 rounded"
					style={{
						backgroundColor: valueToRGB({
							value: proj.projectedFP,
							schema: "fantasyPoints",
						}),
						color: getContrastingColor(
							valueToRGB({
								value: proj.projectedFP,
								schema: "fantasyPoints",
							}),
						),
					}}
				>
					{proj.projectedFP.toFixed(1)}
				</span>
			</div>
		</div>
	);
}
