"use client";

import { useState, useEffect } from "react";
import { Standing } from "@/lib/types";
import { fetchStandings } from "@/lib/supabase";

import Loader from "@/components/loader";
import { DataTable } from "@/components/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { columns } from "./columns";

export default function StandingsPage() {
	const [standings, setStandings] = useState<Standing[] | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				// Fetch team players
				const { data, error } = await fetchStandings();
				if (error) throw error;
				setStandings(data);
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <Loader className="w-full max-w-4xl" />;
	if (error) return <p>Error: {error.message}</p>;
	if (!standings || standings.length == 0) return <p>No players found</p>;

	return (
		<div className="w-full max-w-4xl px-2 flex flex-col items-center">
			<h1 className="text-3xl font-medium text-center mt-8 mb-4">
				Standings
			</h1>
			<Tabs defaultValue="west" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="west">West</TabsTrigger>
					<TabsTrigger value="east">East</TabsTrigger>
				</TabsList>
				<TabsContent value="west">
					<div>
						<DataTable
							columns={columns}
							data={standings.filter(
								(team) => team.conference === "West"
							)}
						/>
					</div>
				</TabsContent>
				<TabsContent value="east">
					<div>
						<DataTable
							columns={columns}
							data={standings.filter(
								(team) => team.conference === "East"
							)}
						/>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
