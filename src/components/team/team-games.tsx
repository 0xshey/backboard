"use client";
import { useState, useEffect } from "react";
import { fetchTeamGames } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Bar, BarChart, CartesianGrid, Cell, LabelList } from "recharts";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import TeamLogo from "@/components/nba/team-logo";

export default function TeamGames({ teamId }: { teamId: string }) {
	const [games, setGames] = useState(null);
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
				setGames(data);
			} catch (error) {
				setError(error as Error);
			} finally {
				setLoading(false);
			}
		};

		fetchData(teamId);
	}, [teamId]);

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error.message}</p>;

	return (
		<div className="mt-16 w-full flex flex-col items-center gap-4">
			<h1 className="text-4xl font-medium">Games</h1>
			{games
				?.filter((game: any) => game.game.statusCode !== 1)
				.sort(
					(a: any, b: any) =>
						new Date(b.game.dateTimeUTC).getTime() -
						new Date(a.game.dateTimeUTC).getTime()
				)
				.map((game: any) => (
					<TeamGame key={game.id} teamGame={game} teamId={teamId} />
				))}

			{/* <pre>{JSON.stringify(games, null, 2)}</pre> */}
		</div>
	);
}

function TeamGame({ teamGame, teamId }: { teamGame: any; teamId: string }) {
	const playingAs = teamGame.homeTeamId === teamId ? "homeTeam" : "awayTeam";
	const homeWin =
		teamGame.points > teamGame.pointsAgainst && playingAs == "homeTeam";

	return (
		<div className="border rounded-lg bg-mu p-4 w-full">
			<div className="grid grid-cols-5">
				<div className="flex h-full w-full justify-center items-center">
					<p>
						{format(new Date(teamGame.game.dateTimeUTC), "MMM. d")}
					</p>
				</div>
				<div className="col-span-3 flex gap-4 justify-center">
					<TeamLogo
						teamId={teamGame.game.homeTeam.teamId}
						size={42}
					/>
					<div
						className={cn(
							"text-right",
							homeWin ? "opacity-100" : "opacity-40"
						)}
					>
						<p>{teamGame.game.homeTeam.teamTricode}</p>
						<p className="text-2xl font-medium tracking-wider">
							{playingAs === "homeTeam"
								? teamGame.points
								: teamGame.pointsAgainst}
						</p>
					</div>
					<div
						className={cn(
							"text-left",
							homeWin ? "opacity-40" : "opacity-100"
						)}
					>
						<p>{teamGame.game.awayTeam.teamTricode}</p>
						<p className="text-2xl font-medium tracking-wider">
							{playingAs === "awayTeam"
								? teamGame.points
								: teamGame.pointsAgainst}
						</p>
					</div>
					<TeamLogo
						teamId={teamGame.game.awayTeam.teamId}
						size={42}
					/>
				</div>
				{/* WL indicator */}
				<div className="flex h-full w-full justify-center items-center">
					<div
						className={cn(
							"h-8 aspect-square flex items-center justify-center rounded-lg border-2 font-bold",
							teamGame.points > teamGame.pointsAgainst
								? "bg-green-500/20 text-green-500 border-green-500"
								: "bg-red-500/20 text-red-500 border-red-500"
						)}
					>
						{teamGame.points > teamGame.pointsAgainst ? "W" : "L"}
					</div>
				</div>
			</div>
			<div className="grid grid-cols-4 gap-2 text-center p-2">
				<GameStat
					label="FG"
					value={`${Math.round(
						teamGame.fieldGoalsPercentage * 100
					)}%`}
					secondaryValue={`${teamGame.fieldGoalsMade}/${teamGame.fieldGoalsAttempted}`}
				/>
				<GameStat
					label="2P"
					value={`${Math.round(
						teamGame.twoPointersPercentage * 100
					)}%`}
					secondaryValue={`${teamGame.twoPointersMade}/${teamGame.twoPointersAttempted}`}
				/>
				<GameStat
					label="3P"
					value={`${Math.round(
						teamGame.threePointersPercentage * 100
					)}%`}
					secondaryValue={`${teamGame.threePointersMade}/${teamGame.threePointersAttempted}`}
				/>
				<GameStat
					label="FT"
					value={`${Math.round(
						teamGame.freeThrowsPercentage * 100
					)}%`}
					secondaryValue={`${teamGame.freeThrowsMade}/${teamGame.freeThrowsAttempted}`}
				/>
				{/* <div
					className={`flex flex-col gap-1 w-full h-full p-2  border rounded-lg aspect-[4] col-span-4`}
				>
					{teamGame.periods && (
						<PeriodScoreChart periodScores={teamGame.periods} />
					)}
				</div> */}
			</div>

			{/* <pre>{JSON.stringify(teamGame, null, 2)}</pre> */}
		</div>
	);
}

function GameStat({
	label,
	value,
	secondaryValue,
	colspan = 1,
}: {
	label: string;
	value: string;
	secondaryValue?: string;
	colspan?: number;
}) {
	const valueClasses = cn(
		"tracking-wider",
		value.length > 3 ? "text-md" : "text-xl"
	);

	return (
		<div
			className={`flex flex-col gap-1 w-full h-full p-2 aspect-square border rounded-lg col-span-${colspan}`}
		>
			<div className="flex w-full h-full items-start justify-between">
				<p className="text-sm uppercase text-muted-foreground">
					{label}
				</p>
				<p className={valueClasses}>{value}</p>
			</div>
			<div className="flex w-full h-full items-end justify-between text-muted">
				<p className="text-sm">{secondaryValue}</p>
			</div>
		</div>
	);
}

function PeriodScoreChart({ periodScores }: { periodScores: any[] }) {
	"use client";
	const chartConfig = {
		score: {
			label: "Score",
		},
	} satisfies ChartConfig;

	return (
		<ChartContainer config={chartConfig} className="h-20">
			<BarChart accessibilityLayer data={periodScores}>
				<CartesianGrid vertical={false} />
				<ChartTooltip
					cursor={false}
					content={<ChartTooltipContent hideLabel hideIndicator />}
				/>
				<Bar dataKey="score">
					<LabelList position="top" dataKey="score" fillOpacity={1} />
					{periodScores.map((item) => (
						<Cell
							key={item.period}
							fill={
								item.score > 0
									? "hsl(var(--chart-1))"
									: "hsl(var(--chart-2))"
							}
						/>
					))}
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
