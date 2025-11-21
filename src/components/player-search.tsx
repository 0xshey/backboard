"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/lib/supabase/client";

export function PlayerSearch() {
	const [query, setQuery] = useState("");
	const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
	const [loading, setLoading] = useState(true);

	async function getAllPlayersSearchable() {
		const { data, error } = await supabaseClient.from("player").select(
			`
			*,
			team:player_team_id_fkey(id,tricode,name,city)
		`
		);

		if (error) {
			console.error("Error fetching players:", error.message);
			throw error;
		}

		return data;
	}

	useEffect(() => {
		async function fetchPlayers() {
			setLoading(true);
			const data = await getAllPlayersSearchable();
			setPlayers(data || []);
			setLoading(false);
		}
		fetchPlayers();
	}, []);

	const filteredPlayers = useMemo(() => {
		if (!query.trim()) return [];

		const q = query.toLowerCase();

		return players
			.filter((p) => {
				const first = p.first_name.toLowerCase();
				const last = p.last_name.toLowerCase();
				const full = `${first} ${last}`;
				return (
					first.includes(q) || last.includes(q) || full.includes(q)
				);
			})
			.sort((a, b) => {
				const aName = `${a.first_name} ${a.last_name}`.toLowerCase();
				const bName = `${b.first_name} ${b.last_name}`.toLowerCase();
				const aIndex = aName.indexOf(q);
				const bIndex = bName.indexOf(q);
				return aIndex - bIndex;
			});
	}, [query, players]);

	return (
		<div className="flex flex-col gap-4 min-h-140">
			<div className="flex items-center gap-2">
				<Input
					id="search"
					name="search"
					placeholder="Search players..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<Button type="button" onClick={() => setQuery(query)}>
					Search
				</Button>
			</div>

			{/* Search Results */}
			<div className="grid gap-2">
				{loading && (
					<p className="text-sm text-muted-foreground">Loading...</p>
				)}

				{!loading && query && filteredPlayers.length === 0 && (
					<p className="text-sm text-muted-foreground">
						No players found
					</p>
				)}

				{filteredPlayers.slice(0, 10).map((player) => (
					<Link
						key={player.id}
						href={`/player/${player.id}`}
						className="px-3 py-2 border rounded-md hover:bg-accent transition-colors"
					>
						{player.first_name} {player.last_name}
					</Link>
				))}
			</div>
		</div>
	);
}
