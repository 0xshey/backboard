"use client";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { FantasyPlayer } from "@/lib/types";
import { fetchPlayers } from "@/lib/supabase";

import DatePicker from "@/components/date-picker";
import { DataTable } from "@/components/data-table";
import { FantasyScatter } from "@/components/chart";
import {
	LoaderIcon,
	BadgeCheckIcon,
	CircleChevronLeftIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { columns } from "./columns";

export default function PlayersPage() {
	const [date, setDate] = useState(new Date()); // using client date

	const [players, setPlayers] = useState<FantasyPlayer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		const fetchData = async (date: Date, updating = false) => {
			if (updating) setUpdating(true);
			else setLoading(true);

			try {
				const { data, error } = await fetchPlayers(date);
				if (error) throw error;
				if (data) {
					setPlayers(data as FantasyPlayer[]);
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

	if (loading) {
		return <Skeleton className="w-full max-w-xl h-40" />;
	}

	if (error) {
		return <p>Error: {error.message}</p>;
	}

	return (
		<div className="w-full max-w-full flex flex-col items-center">
			<DatePicker
				date={date}
				setDate={setDate}
				className="w-full max-w-lg  rounded"
			/>

			<div className="w-full flex justify-center items-center py-2 pr-4 gap-2 text-muted-foreground">
				<LoaderIcon
					size={16}
					className={cn("animate-spin", {
						"text-transparent": !updating,
					})}
				/>
				<BadgeCheckIcon size={16} />
				<p className="text-sm">Official NBA Data</p>
			</div>

			{players.filter((player) => player.played).length > 0 ? (
				<div className="pt-8 flex flex-col gap-8 items-center w-full">
					<div className="w-full max-w-6xl flex flex-col items-center">
						<FantasyScatter
							data={players.filter((player) => player.played)}
						/>
						<p className="text-sm text-center text-balance text-muted-foreground max-w-4xl">
							This chart presents all of todays fantasy
							performances, relative to the same player&apos;s
							season average. <br />
							Look out for players in the{" "}
							<span className="underline">
								top-right corner &#x28;overperforming&#x29;
							</span>{" "}
							and{" "}
							<span className="underline">
								far-left side &#x28;underperforming&#x29;
							</span>
						</p>
					</div>

					<div className="flex flex-col w-full max-w-4xl items-center">
						<DataTable
							columns={columns}
							data={players
								.filter((player) => player.played)
								.sort(
									(a, b) => b.fantasyPoints - a.fantasyPoints
								)}
						/>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center gap-8 mt-40">
					<p className="text-muted-foreground ">
						No players have played yet today.
					</p>
					<Button
						variant={"outline"}
						onClick={() =>
							setDate((d) => {
								const newDate = new Date(d);
								newDate.setDate(newDate.getDate() - 1);
								return newDate;
							})
						}
					>
						<CircleChevronLeftIcon />
						View Previous Day
					</Button>
				</div>
			)}
		</div>
	);
}
