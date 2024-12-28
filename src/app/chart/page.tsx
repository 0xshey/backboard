// This is a page where we test the chart component
"use client";
import { FantasyScatter } from "@/components/chart";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { PlayerGameRow } from "@/lib/types";
import DatePicker from "@/components/date-picker";
import { LoaderIcon, BadgeCheckIcon } from "lucide-react";
import { fetchPlayers } from "@/lib/supabase";

export default function ChartPage() {
	const [date, setDate] = useState(() => new Date());
	const [players, setPlayers] = useState<PlayerGameRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchData = async (date: Date) => {
			setLoading(true);

			try {
				const formattedDate = format(date, "yyyy-MM-dd");
				const { data, error } = await fetchPlayers(formattedDate);
				if (error) throw error;
				if (data) {
					setPlayers(data as PlayerGameRow[]);
				} else {
					setPlayers([]);
				}
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(date);
	}, [date]);

	return (
		<div className="w-full max-w-6xl mx-auto p-4">
			<DatePicker date={date} setDate={setDate} />
			{loading ? (
				<div className="w-full h-40 flex gap-4 items-center justify-center">
					<p>Fetching Players</p>
					<LoaderIcon className="w-5 h-5 animate-spin" />
				</div>
			) : error ? (
				<div className="w-full h-40 flex gap-4 items-center justify-center">
					<p>Error fetching players</p>
					<BadgeCheckIcon className="w-5 h-5" />
				</div>
			) : (
				<>
					<FantasyScatter
						data={players.filter((player) => player.played)}
					/>
				</>
			)}
		</div>
	);
}
