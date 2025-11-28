"use client";
import { useState, useEffect } from "react";
import { fetchTeamGames } from "@/lib/supabase";
import { TeamGame, Game } from "@/lib/types";
import { format } from "date-fns";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from "recharts";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import Loader from "@/components/loader";

export default function TeamGames({ teamId }: { teamId: string }) {
	const [games, setGames] = useState<TeamGame[] | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async (teamId: string) => {
			setLoading(true);
			setError(null);

			try {
				// Fetch team games
				const { data, error } = await fetchTeamGames(teamId);
				if (error) throw error;

				const filteredData = data
					.filter((game: TeamGame) => game.game.statusCode !== 1)
					.sort(
						(a: TeamGame, b: TeamGame) =>
							new Date(b.game.dateTimeUTC).getTime() -
							new Date(a.game.dateTimeUTC).getTime()
					);

				setGames(filteredData);
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(teamId);
	}, [teamId]);

	if (loading) return <Loader className="w-full max-w-4xl" />;
	if (error) return <p>Error: {error.message}</p>;
	if (!games) return <p>No games found</p>;

	const chartConfig = {
		pointsDifferential: {
			label: "PTS δ",
		},
	} satisfies ChartConfig;

	return (
		<div className="mt-8 w-full flex flex-col items-center gap-4">
			<h1 className="text-2xl font-medium">Games</h1>
			<p className="text-muted-foreground">
				Recent &lt;--- Scroll to see more ---&gt; Older
			</p>
			<div className="max-w-4xl w-full overflow-x-scroll">
				<ChartContainer
					config={chartConfig}
					className={`h-[40vh] w-[2500px] bg-linear-to-r`}
				>
					<BarChart accessibilityLayer data={games}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="game.dateTimeUTC"
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => {
								const date = new Date(value);
								return format(date, "MMM d");
							}}
							opacity={0.4}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent hideLabel hideIndicator />
								// <p>Hello</p>
							}
						/>
						<Bar
							dataKey="pointsDifferential"
							radius={8}
							barSize={96}
							opacity={0.6}
							activeBar={{
								opacity: 0.5,
							}}
							label={<p>PTS δ</p>}
						>
							<LabelList
								position="top"
								dataKey="game"
								fillOpacity={1}
								formatter={(value: Game) => value.opposition}
								className="whitespace-nowrap text-[0.6rem] font-medium"
							/>
							{games &&
								games.map((item) => (
									<Cell
										key={item.gameId}
										fill={
											item.pointsDifferential > 0
												? "hsl(var(--chart-2))"
												: item.pointsDifferential < 0
												? "hsl(var(--chart-1))"
												: "hsl(var(--chart-3))"
										}
									/>
								))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</div>
			{/* <pre>{JSON.stringify(games, null, 2)}</pre> */}
		</div>
	);
}
