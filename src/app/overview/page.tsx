"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { fetchOverview } from "@/lib/api";
import { BadgeCheckIcon, LoaderIcon } from "lucide-react";

import DatePicker from "@/components/custom/date-picker";
import LiveGames from "@/components/custom/live-games";
import LivePlayers from "@/components/custom/live-players";

export default function OverviewPage() {
	const [date, setDate] = useState(new Date());
	const [data, setData] = useState({ games: [], players: [] });
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		const fetchData = async (date: Date, updating = false) => {
			updating ? setUpdating(true) : setLoading(true);
			const formattedDate = format(date, "yyyy-MM-dd");
			const overviewData = await fetchOverview({ date: formattedDate });
			setData(overviewData);
			updating ? setUpdating(false) : setLoading(false);
		};

		fetchData(date);

		const interval = setInterval(() => {
			fetchData(date, true);
		}, 15000);

		return () => clearInterval(interval);
	}, [date]);

	return (
		<div className="w-full flex flex-col items-center">
			<DatePicker
				date={date}
				setDate={setDate}
				className="w-full max-w-sm"
			/>

			<div className="w-full flex justify-center items-center py-4 pr-4 gap-2 text-muted-foreground my-4">
				<LoaderIcon
					size={16}
					className={cn("animate-spin", {
						"text-transparent": !updating,
					})}
				/>
				<BadgeCheckIcon size={16} />
				<p className="text-sm">Official NBA Data</p>
			</div>

			{/* Games */}
			<LiveGames games={data.games} loading={loading} />

			{/* <pre>
				{data.players && JSON.stringify(data.players[0], null, 2)}
			</pre> */}

			{/* Players */}
			<LivePlayers players={data.players} loading={loading} />
		</div>
	);
}
