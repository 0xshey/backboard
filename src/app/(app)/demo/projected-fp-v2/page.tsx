import { Suspense } from "react";
import { fetchMostRecentDateWithPlayers } from "@/app/(app)/rankings/functions";
import { ProjectedFPV2Content } from "./projected-fp-v2-content";
import { ProjectedFPV2Controls } from "./projected-fp-v2-controls";

export const revalidate = 300;

const DEFAULT_ABSORPTION = 0.6;

export default async function ProjectedFPV2Page({
	searchParams,
}: {
	searchParams: Promise<{ date?: string; absorption?: string }>;
}) {
	const params = await searchParams;
	const date =
		params.date ?? (await fetchMostRecentDateWithPlayers()) ?? "2025-10-01";
	const absorptionRate = Math.min(
		1,
		Math.max(0, parseFloat(params.absorption ?? String(DEFAULT_ABSORPTION))),
	);

	return (
		<div className="flex flex-col items-center gap-6 py-8 min-h-screen">
			<div className="w-full max-w-4xl px-4 flex flex-col gap-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-semibold">FP Projections v2</h1>
					<p className="text-sm text-muted-foreground">
						<code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
							PROJ = BASE × OPP_DEF × HOME_AWAY × PACE × INJURY
						</code>
					</p>
				</div>

				<Suspense fallback={null}>
					<ProjectedFPV2Controls absorptionRate={absorptionRate} />
				</Suspense>

				<Suspense fallback={<LoadingSkeleton />}>
					<ProjectedFPV2Content
						date={date}
						absorptionRate={absorptionRate}
					/>
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
