"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fetchStandings } from "@/lib/supabase";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default function StandingsPage() {
	const [date, setDate] = useState(new Date()); // using client date

	const [standings, setStandings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const fetchData = async (date: Date) => {
			setLoading(true);

			try {
				const formattedDate = format(date, "yyyy-MM-dd");
				const { data, error } = await fetchStandings(formattedDate);
				if (error) throw error;
				if (data) {
					if (data.length === 0) {
						// set date to yesterday and try again
						const yesterday = new Date(date);
						yesterday.setDate(yesterday.getDate() - 1);
						setDate(yesterday);
						fetchData(yesterday);
						return;
					}
					setStandings(data as any[]);
				} else {
					setStandings([]);
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
		<div className="flex flex-col items-center w-full gap-4 xl:max-w-6xl max-w-xl">
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
				{["West", "East"].map((conference) => (
					<div className="text-4xl col-span-1 mx-4" key={conference}>
						<h2>{conference}</h2>
						<DataTable
							columns={columns}
							data={standings
								.filter(
									(row) => row.team.conference === conference
								)
								.sort(
									(a, b) =>
										b.wins / (b.wins + b.losses) -
										a.wins / (a.wins + a.losses)
								)}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
