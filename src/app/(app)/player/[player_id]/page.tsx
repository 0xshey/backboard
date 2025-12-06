// app/player/[player_id]/page.tsx
import { type Metadata } from "next";
import { formatSecondsToMMSS } from "@/lib/utils";
import { PlayerHeader } from "@/components/player/player-header";

import {
	getPlayer,
	getPlayerGames,
	getTeamGames,
	getFantasyGameWeeks,
} from "./functions";

/* ────────────────────────────────
   Metadata
──────────────────────────────── */
export const metadata: Metadata = {
	title: "Player Details",
	description: "View player stats and info",
};

/* ────────────────────────────────
   Helpers: Date utilities
──────────────────────────────── */
function formatDateNY(date: Date, opts?: Intl.DateTimeFormatOptions) {
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		month: "short",
		day: "numeric",
		...opts,
	}).format(date);
}

function sameDayNY(a: Date, b: Date) {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone: "America/New_York",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	return fmt.format(a) === fmt.format(b);
}

/* ────────────────────────────────
   Main Page
──────────────────────────────── */
export default async function PlayerPage({
	params,
}: {
	params: { player_id: string };
}) {
	const { player_id } = await params;

	const player = await getPlayer(player_id);
	const playerGames = await getPlayerGames(player_id);
	const fantasyGameWeeks = await getFantasyGameWeeks();

	const teamGames = player.team_id ? await getTeamGames(player.team_id) : [];

	return (
		<div className="w-full max-w-full flex flex-col items-center px-2">
			{/* Player Header */}
			<PlayerHeader player={player} gamePlayerRows={playerGames} />

			<PlayerGamelog
				gamePlayerRows={playerGames}
				schedule={teamGames}
				fantasyGameWeeks={fantasyGameWeeks}
			/>
		</div>
	);
}

/* ────────────────────────────────
   Component: Player Gamelog
──────────────────────────────── */
function PlayerGamelog({
	gamePlayerRows,
	schedule,
	fantasyGameWeeks,
}: {
	gamePlayerRows: any[];
	schedule: any[];
	fantasyGameWeeks: any[];
}) {
	const headers = [
		"vs.",
		"MIN",
		"PTS",
		"REB",
		"AST",
		"STL",
		"BLK",
		"TOV",
		"FP",
	];
	const playerTeamId = gamePlayerRows[0]?.team_id;

	return (
		<div className="flex flex-col relative max-h-[1200px] overflow-y-scroll scrollbar-hidden w-full max-w-xl rounded-xl">
			{/* Header Row */}
			<div className="grid grid-cols-10 gap-2 font-semibold px-4 py-2 text-xs text-muted-foreground sticky top-0 backdrop-blur-md">
				<div className="text-left">Date</div>
				{headers.map((header) => (
					<div
						key={header}
						className="text-right border-l border-muted"
					>
						{header}
					</div>
				))}
			</div>

			{/* Game Weeks */}
			<div className="flex flex-col gap-4">
				{fantasyGameWeeks.map((gameWeek) => (
					<GamelogWeek
						key={gameWeek.number}
						gameWeek={gameWeek}
						gamePlayerRows={gamePlayerRows}
						schedule={schedule}
						playerTeamId={playerTeamId}
					/>
				))}
			</div>
		</div>
	);
}

/* ────────────────────────────────
   Component: Gamelog Week
──────────────────────────────── */
function GamelogWeek({
	gameWeek,
	gamePlayerRows,
	schedule,
	playerTeamId,
}: {
	gameWeek: any;
	gamePlayerRows: any[];
	schedule: any[];
	playerTeamId: string;
}) {
	// Create list of days within the game week
	const start = new Date(gameWeek.start_date);
	const end = new Date(gameWeek.end_date);
	const days: Date[] = [];
	for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
		days.push(new Date(d.toISOString()));
	}

	return (
		<div className="flex flex-col gap-1 border rounded-2xl p-2">
			<h3 className="font-bold ml-4">{gameWeek.label}</h3>
			{days.map((date) => (
				<DateRow
					key={date.toISOString()}
					date={date}
					gamePlayerRows={gamePlayerRows}
					schedule={schedule}
					playerTeamId={playerTeamId}
				/>
			))}
		</div>
	);
}

/* ────────────────────────────────
   Component: Date Row
──────────────────────────────── */
function DateRow({
	date,
	gamePlayerRows,
	schedule,
	playerTeamId,
}: {
	date: Date;
	gamePlayerRows: any[];
	schedule: any[];
	playerTeamId: string;
}) {
	const gamePlayer =
		gamePlayerRows.find((gp) =>
			sameDayNY(new Date(gp.game.datetime), date)
		) || null;
	const scheduledGame =
		schedule.find((g) => sameDayNY(new Date(g.datetime), date)) || null;

	return (
		<div
			className={`grid grid-cols-10 gap-2 text-right rounded-lg px-2 whitespace-nowrap text-xs ${
				gamePlayer
					? "border py-2 bg-muted"
					: scheduledGame
					? "border border-dashed py-2 bg-muted"
					: "py-1 text-muted-foreground bg-muted/50"
			}`}
		>
			<div className="font-stretch-75%">
				{formatDateNY(date, { hour12: true })}
			</div>

			{gamePlayer ? (
				<GamePlayerStatline gamePlayer={gamePlayer} />
			) : scheduledGame ? (
				<ScheduledGameRow
					game={scheduledGame}
					playerTeamId={playerTeamId}
				/>
			) : (
				<div className="col-span-9 text-center text-muted-foreground"></div>
			)}
		</div>
	);
}

/* ────────────────────────────────
   Component: Game Player Statline
──────────────────────────────── */
function GamePlayerStatline({ gamePlayer }: { gamePlayer: any }) {
	if (!gamePlayer.played)
		return (
			<>
				<div className="font-stretch-75%">
					{gamePlayer.opp_team.tricode}
				</div>
				<div className="col-span-8 flex justify-center text-muted-foreground">
					DNP: {gamePlayer.not_playing_description}
				</div>
			</>
		);

	return (
		<>
			<div>{gamePlayer.opp_team.tricode}</div>
			<div className="font-semibold">
				{formatSecondsToMMSS(gamePlayer.seconds)}
			</div>
			<div className="font-semibold">{gamePlayer.points}</div>
			<div className="font-semibold">{gamePlayer.rebounds_total}</div>
			<div className="font-semibold">{gamePlayer.assists}</div>
			<div className="font-semibold">{gamePlayer.steals}</div>
			<div className="font-semibold">{gamePlayer.blocks}</div>
			<div className="font-semibold">{gamePlayer.turnovers}</div>
			<div className="font-semibold">{gamePlayer.fp}</div>
		</>
	);
}

/* ────────────────────────────────
   Component: Scheduled Game Row
──────────────────────────────── */
function ScheduledGameRow({
	game,
	playerTeamId,
}: {
	game: any;
	playerTeamId: string;
}) {
	const isHome = playerTeamId === game.home_team.id;
	return (
		<>
			<div className="font-stretch-75% col-span-2 justify-center flex gap-0.5">
				<span className={!isHome ? "text-muted-foreground" : ""}>
					{game.away_team.tricode}
				</span>
				@
				<span className={isHome ? "text-muted-foreground" : ""}>
					{game.home_team.tricode}
				</span>
			</div>
			<div className="col-span-7 justify-center flex gap-0.5 text-muted-foreground">
				Projected Stats placeholder
			</div>
		</>
	);
}
