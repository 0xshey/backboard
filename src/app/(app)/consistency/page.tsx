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
			<h1 className="text-4xl font-semibold mb-8">
				Consistency Rankings
			</h1>
			<ConsistencyGrid data={data || []} />
		</div>
	);
}
