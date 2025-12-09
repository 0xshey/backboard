import { Suspense } from "react";
import { RankingsControls } from "@/components/rankings/rankings-controls";
import { RankingsContent } from "./rankings-content";
import { GameChip } from "@/components/game/game-chip";
import { PlayerRankingsGrid } from "@/components/rankings/player-rankings-grid";

export const revalidate = 60;

function RankingsContentSkeleton() {
    return (
        <>
            <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-3 items-center gap-2 px-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <GameChip key={i} loading={true} />
                ))}
            </div>
            <div className="w-full max-w-6xl flex justify-center gap-4 p-2">
                <PlayerRankingsGrid loading={true} />
            </div>
        </>
    );
}

export default async function RankingsPage({
	searchParams,
}: {
	searchParams: { date: string };
}) {
	const resolvedSearchParams = await searchParams;
	const todayNYString = new Date()
		.toLocaleDateString("en-CA", {
			timeZone: "America/Los_Angeles",
		})
		.replaceAll("/", "-");
	const dateString = resolvedSearchParams.date || todayNYString;

	return (
		<div className="w-full flex flex-col items-center gap-4">
			<RankingsControls />
            <Suspense key={dateString} fallback={<RankingsContentSkeleton />}>
                <RankingsContent date={dateString} />
            </Suspense>
		</div>
	);
}

