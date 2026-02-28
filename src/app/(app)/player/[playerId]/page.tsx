import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlayerSeasonCard } from "@/components/player/player-season-card";
import { PerformanceChart } from "@/components/player/performance-chart";
import type { Database } from "@/types/supabase";

export const revalidate = 300;

type PlayerRow = Database["public"]["Tables"]["player"]["Row"];
type TeamRow = Database["public"]["Tables"]["team"]["Row"];
type SeasonAveragesRow =
	Database["public"]["Tables"]["player_season_averages"]["Row"];
type GameRow = Database["public"]["Tables"]["game"]["Row"];
type GamePlayerRow = Database["public"]["Tables"]["game_player"]["Row"];

export type PlayerWithTeam = PlayerRow & { team: TeamRow | null };

export type GameLogFull = GamePlayerRow & {
	game: GameRow;
	team: TeamRow | null;
	opp_team: TeamRow | null;
};

async function fetchPlayerData(playerId: string) {
	const supabase = await createClient();

	const [playerResult, seasonAvgResult, gameLogsResult] = await Promise.all([
		supabase
			.from("player")
			.select("*, team(*)")
			.eq("id", playerId)
			.single(),

		supabase
			.from("player_season_averages")
			.select("*")
			.eq("player_id", playerId)
			.eq("season", "2025-26")
			.maybeSingle(),

		supabase
			.from("game_player")
			.select(
				"*, game!inner(*), team:team!game_player_team_fkey(*), opp_team:game_player_team_opp_id_fkey(*)",
			)
			.eq("player_id", playerId)
			.limit(100),
	]);

	return {
		player: playerResult.data as PlayerWithTeam | null,
		seasonAverages: seasonAvgResult.data as SeasonAveragesRow | null,
		gameLogs: (gameLogsResult.data ?? []) as unknown as GameLogFull[],
	};
}

function LoadingSkeleton() {
	return (
		<div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6 animate-pulse">
			<div className="rounded-2xl bg-muted h-48" />
			<div className="rounded-2xl bg-muted h-72" />
			<div className="rounded-2xl bg-muted h-48" />
		</div>
	);
}

async function PlayerContent({ playerId }: { playerId: string }) {
	const { player, seasonAverages, gameLogs } =
		await fetchPlayerData(playerId);

	if (!player) notFound();

	// Sort chronologically
	const sortedLogs = [...gameLogs].sort((a, b) => {
		const aTime = a.game?.datetime
			? new Date(a.game.datetime).getTime()
			: 0;
		const bTime = b.game?.datetime
			? new Date(b.game.datetime).getTime()
			: 0;
		return aTime - bTime;
	});

	const teamColor = player.team?.color_primary_hex ?? null;

	return (
		<div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
			<PlayerSeasonCard
				player={player}
				seasonAverages={seasonAverages}
				gameLogs={sortedLogs}
			/>

			{sortedLogs.length > 0 && (
				<PerformanceChart gameLogs={sortedLogs} teamColor={teamColor} />
			)}
		</div>
	);
}

export default async function PlayerPage({
	params,
}: {
	params: Promise<{ playerId: string }>;
}) {
	const { playerId } = await params;

	return (
		<Suspense fallback={<LoadingSkeleton />}>
			<PlayerContent playerId={playerId} />
		</Suspense>
	);
}
