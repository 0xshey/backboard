"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GamePlayer } from "@/types";

interface GameBreakdownProps {
	playerId: string;
}

export function GameBreakdown({ playerId }: GameBreakdownProps) {
	const [games, setGames] = useState<GamePlayer[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchGames = async () => {
			setLoading(true);
			try {
				const supabase = createClient();
				const { data, error } = await supabase
					.from("game_player")
					.select("*")
					.eq("player_id", playerId)
					.limit(50); // Limit for safety

				if (error) throw error;
				setGames(data);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchGames();
	}, [playerId]);

	if (loading) {
		return (
			<div className="p-4 text-sm text-muted-foreground animate-pulse">
				Loading game history...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 text-sm text-red-500">
				Error loading games: {error}
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden">
			<pre className="w-full overflow-x-auto p-4 text-xs font-mono bg-muted/50 rounded-lg">
				{JSON.stringify(games, null, 2)}
			</pre>
		</div>
	);
}
