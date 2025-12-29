"use client";

import { valueToRGB } from "@/lib/utils";
import type { PlayerConsistency } from "@/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function ConsistencyGrid({ data }: { data: PlayerConsistency[] }) {
	const processedData = data
		.filter(
			(player) => (player.games_missed ?? 0) <= (player.games_played ?? 0)
		)
		.sort((a, b) => (a.variation_pct ?? 0) - (b.variation_pct ?? 0));

	return (
		<Table>
			<TableHeader>
				<TableRow className="font-semibold text-muted-foreground hover:bg-transparent">
					<TableHead className="w-[300px]">Player</TableHead>
					<TableHead className="text-right">Games (P/M)</TableHead>
					<TableHead className="text-right">FP/G</TableHead>
					<TableHead className="text-right">σ</TableHead>
					<TableHead className="text-right">σ%</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{processedData?.map((row) => (
					<TableRow
						key={row.player_id}
						className="text-md md:text-xl font-semibold"
					>
						<TableCell>
							{row.first_name} {row.last_name}
						</TableCell>
						<TableCell className="text-right">
							<div className="flex justify-end gap-2">
								<span>{row.games_played ?? 0}</span>
								<span className="text-muted-foreground">
									{row.games_missed ?? 0}
								</span>
							</div>
						</TableCell>
						<TableCell
							className="text-right"
							style={{
								color: valueToRGB({
									value: row.avg_fantasy_points ?? 0,
									midColor: [200, 200, 200, 1],
								}),
							}}
						>
							{row.avg_fantasy_points?.toFixed(2) ?? "0.00"}
						</TableCell>
						<TableCell className="text-right">
							{row.consistency_std?.toFixed(2) ?? "0.00"}
						</TableCell>
						<TableCell
							className="text-right"
							style={{
								color: valueToRGB({
									value: row.variation_pct ?? 0,
									min: 15,
									max: 60,
									lowColor: [43, 168, 74, 1],
									midColor: [200, 200, 200, 1],
									highColor: [192, 11, 35, 1],
								}),
							}}
						>
							{row.variation_pct?.toFixed(1) ?? "0.0"}%
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
