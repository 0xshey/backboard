import { createClient } from "@/lib/supabase/server";
import { ConsistencyGrid } from "@/components/consistency/consistency-grid";
import type { PlayerConsistency } from "@/types";

export default async function ConsistencyPage() {
	const supabase = await createClient();

	const { data } = await supabase
		.from("player_consistency")
		.select("*")
		.order("variation_pct", { ascending: true });

	return (
		<div className="w-full max-w-4xl px-2">
			<div className="mb-8 mt-12 px-2 space-y-2">
				<h1 className="text-4xl font-semibold">Fantasy Consistency</h1>
				<p className="text-sm text-muted-foreground">
					View players by Fantasy Points consistency metrics. The
					primary indicator used here is the standard deviation (σ) of
					a player's Fantasy Points per game. <br />
					<br />
					The higher the standard deviation, the more inconsistent the
					player's performances.
				</p>
			</div>
			<ConsistencyGrid data={data || []} />
		</div>
	);
}
