import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export interface PlayerSearchResult {
	id: number;
	first_name: string;
	last_name: string;
	jersey_number: number | null;
	team: {
		id: number;
	} | null;
}

function relevanceScore(
	player: { first_name: string; last_name: string },
	q: string,
): number {
	const query = q.toLowerCase();
	const first = player.first_name.toLowerCase();
	const last = player.last_name.toLowerCase();
	const full = `${first} ${last}`;

	if (last.startsWith(query)) return 0;
	if (full.startsWith(query)) return 1;
	if (first.startsWith(query)) return 2;
	if (last.includes(query)) return 3;
	if (first.includes(query)) return 4;
	return 5;
}

export async function GET(req: NextRequest) {
	const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

	if (q.length < 2) {
		return NextResponse.json([]);
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("player")
		.select("id, first_name, last_name, jersey_number, team:team_id(id)")
		.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
		.limit(20);

	if (error || !data) {
		return NextResponse.json([]);
	}

	const sorted = (data as unknown as PlayerSearchResult[])
		.sort((a, b) => relevanceScore(a, q) - relevanceScore(b, q))
		.slice(0, 10);

	return NextResponse.json(sorted);
}
