import React from "react";
import { cn } from "@/lib/utils";
import { parseDuration } from "@/lib/utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TeamLogo from "@/components/nba/team-logo";

interface Player {
	id: string;
	teamId: string;
	firstName: string;
	lastName: string;
	minutes: string;
	points: number;
	reboundsTotal: number;
	assists: number;
	steals: number;
	blocks: number;
	turnovers: number;
	fp: number;
	fpSeason: number;
	fpDelta: number;
	tags: string[];
	stillPlaying: boolean;
}

interface LivePlayersTableProps {
	title?: string;
	players: Player[];
}

interface LivePlayersProps {
	players: any[];
	loading: boolean;
}

export default function LivePlayers({ players, loading }: LivePlayersProps) {
	if (!players) {
		return <Skeleton className="w-full h-20" />;
	}

	// Create a list for players that have 'playing-now' in their .tags array
	const playingNow = players
		.filter((player) => player.tags.includes("playing-now"))
		.sort((a, b) => b.fp - a.fp);
	const goodPerformers = players
		.filter((player) => player.tags.includes("good-list"))
		.sort((a, b) => b.fp - a.fp);
	const poorPerformers = players
		.filter((player) => player.tags.includes("poor-list"))
		.sort((a, b) => b.fp - a.fp);

	// return <pre>{JSON.stringify(players.good, null, 2)}</pre>;

	return (
		<div className="w-full max-w-md md:max-w-xl flex flex-col items-center">
			{loading ? (
				<>
					<div className="flex flex-col items-start gap-2 mt-12 w-full">
						<Skeleton className="h-8 w-48 mb-2" />
						{Array.from({ length: 12 }).map((_, index) => (
							<Skeleton key={index} className="h-6 w-full" />
						))}
					</div>
				</>
			) : (
				<>
					<Tabs
						defaultValue={"good"}
						className="w-full mt-4 flex flex-col items-center"
					>
						<TabsList
							className={`grid w-full max-w-sm ${
								playingNow.length > 0
									? "grid-cols-3"
									: "grid-cols-2"
							}`}
						>
							{playingNow.length > 0 && (
								<TabsTrigger value="live">Live</TabsTrigger>
							)}
							<TabsTrigger value="good">Good</TabsTrigger>
							<TabsTrigger value="poor">Uh-Oh</TabsTrigger>
						</TabsList>
						{playingNow.length > 0 && (
							<TabsContent value="live">
								<h2 className="text-4xl text-center font-semibold my-4 tracking-widest">
									STILL PLAYING
								</h2>
								<LivePlayersTable players={playingNow} />
							</TabsContent>
						)}
						<TabsContent value="good">
							<h2 className="text-6xl text-center font-semibold my-4 tracking-widest">
								📈
							</h2>
							<LivePlayersTable players={goodPerformers} />
						</TabsContent>
						<TabsContent value="poor">
							<h2 className="text-6xl text-center font-semibold my-4 tracking-widest">
								📉
							</h2>
							<LivePlayersTable players={poorPerformers} />
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	);
}

export function LivePlayersTable({ players }: LivePlayersTableProps) {
	const tableHeadClass = cn("text-[0.7rem]", "px-1", "text-center");
	const tableCellClass = cn("py-1", "text-xs", "pr-0");
	const playerNameClass = cn(
		"whitespace-nowrap",
		"font-condensed",
		"max-w-26",
		"md:max-w-none",
		"truncate"
	);
	const stillPlayingClass = (stillPlaying: boolean) =>
		cn(
			"w-1",
			"h-1",
			"rounded-full",
			stillPlaying ? "bg-green-500" : "bg-transparent"
		);

	if (!players.length) {
		return (
			<div className="flex justify-center italic">
				<p className="text-muted-foreground">
					Waiting for games to start
				</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className={cn(tableHeadClass, "text-left")}>
						Player
					</TableHead>
					<TableHead className={tableHeadClass}>MIN</TableHead>
					<TableHead className={tableHeadClass}>PTS</TableHead>
					<TableHead className={tableHeadClass}>REB</TableHead>
					<TableHead className={tableHeadClass}>AST</TableHead>
					<TableHead className={tableHeadClass}>STL</TableHead>
					<TableHead className={tableHeadClass}>BLK</TableHead>
					<TableHead className={tableHeadClass}>TOV</TableHead>
					<TableHead className={tableHeadClass}>FP</TableHead>
					<TableHead className={tableHeadClass}>&delta;</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{players.map((player) => (
					<TableRow key={player.id}>
						<TableCell className={tableCellClass}>
							<div className="flex items-center gap-1 justify-between">
								<div className="flex items-center">
									<p className={playerNameClass}>
										{player.firstName[0]}. {player.lastName}
									</p>
									<TeamLogo
										teamId={player.teamId}
										size={16}
									/>
								</div>
								<div
									className={stillPlayingClass(
										player.stillPlaying
									)}
								/>
							</div>
						</TableCell>
						<TableCell className={cn(tableCellClass, "text-left")}>
							{parseDuration(player.minutes)}
						</TableCell>
						<TableCell className={tableCellClass}>
							{player.points}
						</TableCell>
						<TableCell className={tableCellClass}>
							{player.reboundsTotal}
						</TableCell>
						<TableCell className={tableCellClass}>
							{player.assists}
						</TableCell>
						<TableCell className={tableCellClass}>
							{player.steals}
						</TableCell>
						<TableCell className={tableCellClass}>
							{player.blocks}
						</TableCell>
						<TableCell className={tableCellClass}>
							{player.turnovers}
						</TableCell>
						<TableCell className={tableCellClass}>
							{player.fp}
						</TableCell>
						<TableCell className={tableCellClass}>
							<p>
								{player.fp - player.fpSeason > 0 ? "+" : ""}
								{player.fpDelta.toFixed(1)}{" "}
							</p>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
