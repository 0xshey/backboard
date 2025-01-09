"use client";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Game } from "@/lib/types";
import { fetchGames } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import DatePicker from "@/components/date-picker";
import GameCard from "@/components/game";
import { LoaderIcon, BadgeCheckIcon } from "lucide-react";

export default function GamesPage() {
	const [date, setDate] = useState(new Date()); // using client date
	const [games, setGames] = useState<Game[]>([]);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		const fetchData = async (date: Date, updating = false) => {
			if (updating) setUpdating(true);
			else setLoading(true);
			setError(null);

			try {
				// Fetch games
				const { data: gamesData, error: gamesError } = await fetchGames(
					date
				);
				if (gamesError) throw gamesError;
				setGames(gamesData);
			} catch (error) {
				setError(error as Error);
			} finally {
				if (updating) setUpdating(false);
				else setLoading(false);
			}
		};

		fetchData(date);

		const interval = setInterval(() => {
			fetchData(date, true);
		}, 15000);

		return () => clearInterval(interval);
	}, [date]);

	return (
		<div className="w-full max-w-full flex flex-col gap-4 items-center">
			<DatePicker
				date={date}
				setDate={setDate}
				className="w-full max-w-lg  rounded"
			/>
			<div className="w-full flex justify-center items-center py-4 pr-4 gap-2 text-muted-foreground">
				<LoaderIcon
					size={16}
					className={cn("animate-spin", {
						"text-transparent": !updating,
					})}
				/>
				<BadgeCheckIcon size={16} />
				<p className="text-sm">Official NBA Data</p>
			</div>
			{loading && <Skeleton className="w-full max-w-xl h-40" />}
			{error && <p>Error: {error.message}</p>}
			<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mx-2">
				{games.map((game) => (
					<GameCard key={game.gameId} game={game} />
				))}
			</div>
			<pre>{JSON.stringify(games, null, 2)}</pre>
		</div>
	);
}
