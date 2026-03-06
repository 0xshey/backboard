"use client";

import { useEffect, useState } from "react";
import { Rows2, Minus } from "lucide-react";
import { GameChip } from "@/components/game/game-chip";
import { GameChipCompact } from "@/components/game/game-chip-compact";
import type { TeamStanding } from "@/app/(app)/rankings/functions";

interface RankingsGamesSectionProps {
	games: any[];
	standings: Record<string, TeamStanding>;
}

export function RankingsGamesSection({
	games,
	standings,
}: RankingsGamesSectionProps) {
	const [collapsed, setCollapsed] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem("games-section-collapsed");
		if (stored !== null) setCollapsed(stored === "true");
	}, []);

	function toggle() {
		setCollapsed((c) => {
			localStorage.setItem("games-section-collapsed", String(!c));
			return !c;
		});
	}

	// Priority: Live (2) → Finished (3) → Upcoming (1)
	const statusPriority: Record<number, number> = { 2: 0, 3: 1, 1: 2 };

	const sortedGames = [...games]
		.sort(
			(a, b) =>
				new Date(a.datetime ?? 0).getTime() -
				new Date(b.datetime ?? 0).getTime(),
		)
		.sort(
			(a, b) =>
				(statusPriority[a.status_code ?? 0] ?? 99) -
				(statusPriority[b.status_code ?? 0] ?? 99),
		);

	return (
		<div className="w-full max-w-4xl flex flex-col gap-2">
			<div className="flex justify-end">
				<button
					onClick={toggle}
					className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-1 rounded-md hover:bg-muted"
				>
					{collapsed ? <Rows2 size={14} /> : <Minus size={14} />}
					<span>{collapsed ? "Expand" : "Collapse"}</span>
				</button>
			</div>

			{collapsed ? (
				<div className="flex flex-row gap-2 overflow-x-auto pb-3 px-3">
					{sortedGames.map((g) => (
						<GameChipCompact
							key={g.id}
							game={g}
							standings={standings}
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-3">
					{sortedGames.map((g) => (
						<GameChip key={g.id} game={g} standings={standings} />
					))}
				</div>
			)}
		</div>
	);
}
