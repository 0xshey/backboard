import { Suspense } from "react";
import { fetchMostRecentDateWithPlayers } from "@/app/(app)/rankings/functions";
import { ProjectedFPContent } from "./projected-fp-content";
import { ProjectedFPControls } from "./projected-fp-controls";

export const revalidate = 300;

export default async function ProjectedFPPage({
	searchParams,
}: {
	searchParams: Promise<{ date?: string }>;
}) {
	const params = await searchParams;
	const date =
		params.date ?? (await fetchMostRecentDateWithPlayers()) ?? "2025-10-01";

	return (
		<div className="flex flex-col items-center gap-6 py-8 min-h-screen">
			<div className="w-full max-w-4xl px-4 flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold">FP Projections</h1>
					<p className="text-sm text-muted-foreground">
						<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
							PROJ = BASE × OPP_DEF × HOME_AWAY × PACE
						</code>
					</p>
				</div>

				<Suspense fallback={null}>
					<ProjectedFPControls />
				</Suspense>

				<Suspense fallback={<LoadingSkeleton />}>
					<ProjectedFPContent date={date} />
				</Suspense>
			</div>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="flex flex-col gap-6 animate-pulse">
			<div className="h-20 bg-muted rounded-xl" />
			<div className="h-72 bg-muted rounded-xl" />
			<div className="h-20 bg-muted rounded-xl" />
			<div className="h-56 bg-muted rounded-xl" />
		</div>
	);
}
