"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { PlayerGameRow } from "@/lib/types";
import { fetchPlayers } from "@/lib/supabase";

import DatePicker from "@/components/date-picker";
import { DataTable } from "@/components/data-table";
import { LoaderIcon, BadgeCheckIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

import { columns } from "./columns";

export default function PlayersPage() {
	const [date, setDate] = useState(new Date()); // using client date

	const [players, setPlayers] = useState<PlayerGameRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [updating, setUpdating] = useState(false);
	const [tagFilter, setTagFilter] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async (date: Date, updating = false) => {
			if (updating) setUpdating(true);
			else setLoading(true);

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
		<div className="w-full max-w-full flex flex-col items-center">
			<DatePicker
				date={date}
				setDate={setDate}
				className="w-full max-w-lg  rounded"
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

			{/* <pre>{JSON.stringify(players, null, 2)}</pre> */}

			<div className="py-8 flex flex-col items-center w-full max-w-xl">
				<Tabs
					defaultValue={"good"}
					className="w-full mt-4 flex flex-col items-center"
				>
					<TabsList className="grid mx-2 grid-cols-4">
						<TabsTrigger value="good">Good</TabsTrigger>
						<TabsTrigger value="bad">Bad</TabsTrigger>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="live">Live</TabsTrigger>
					</TabsList>
					<TabsContent value="live">
						<h2 className="text-4xl text-center font-medium my-4">
							Playing Now
						</h2>
						<DataTable
							columns={columns}
							data={players.filter((player) =>
								player.tags.includes("still-playing")
							)}
						/>
					</TabsContent>
					<TabsContent value="good">
						<h2 className="text-4xl text-center font-medium my-4">
							Good Performers
						</h2>
						<DataTable
							columns={columns}
							data={players
								.filter((player) =>
									player.tags.includes("good-list")
								)
								.sort((a, b) => b.fp - a.fp)}
						/>
					</TabsContent>
					<TabsContent value="bad">
						<h2 className="text-4xl text-center font-medium my-4">
							Bad Performers
						</h2>
						<DataTable
							columns={columns}
							data={players
								.filter((player) =>
									player.tags.includes("bad-list")
								)
								.sort((a, b) => b.fp - a.fp)}
						/>
					</TabsContent>
					<TabsContent value="all">
						<h2 className="text-4xl text-center font-medium my-4">
							All Players
						</h2>
						<DataTable
							columns={columns}
							data={players
								.filter((player) =>
									player.tags.includes("played")
								)
								.sort((a, b) => b.fp - a.fp)}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
