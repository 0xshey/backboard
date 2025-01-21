"use client";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { GameSummary } from "@/lib/types";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import TeamLogo from "@/components/nba/team-logo";

interface GameStatusProps {
	statusCode: number;
	statusText: string;
	dateTimeUTC: string;
	nationalBroadcaster: string;
}

interface TeamProps {
	teamId: string;
	teamName: string;
	conference: string;
	conferenceRank: number;
	score: number;
	record: string;
	isLeading: boolean;
	gameStatusCode: number;
}

function GameCard({ game }: { game: GameSummary }) {
	const awayTeam = {
		teamId: game.awayTeamId,
		teamName: game.awayTeamName,
		score: game.awayTeamScore,
	};
	const homeTeam = {
		teamId: game.homeTeamId,
		teamName: game.homeTeamName,
		score: game.homeTeamScore,
	};

	return (
		<div
			className={cn(
				"flex flex-col items-start gap-2 py-3 px-1 rounded-xl shadow border w-full",
				{
					"md:flex-row md:justify-between md:p-4 md:w-80": true,
					"border-red-500": game.statusCode == 2,
				}
			)}
		>
			<div className="flex flex-col gap-2 items-between">
				<Team
					teamId={awayTeam.teamId}
					teamName={awayTeam.teamName}
					conference={game.awayTeamConference}
					conferenceRank={game.awayTeamConferenceRank}
					score={awayTeam.score}
					record={`${game.awayTeamWins}-${game.awayTeamLosses}`}
					isLeading={awayTeam.score > homeTeam.score}
					gameStatusCode={game.statusCode}
				/>
				<Team
					teamId={homeTeam.teamId}
					teamName={homeTeam.teamName}
					conference={game.homeTeamConference}
					conferenceRank={game.homeTeamConferenceRank}
					score={homeTeam.score}
					record={`${game.homeTeamWins}-${game.homeTeamLosses}`}
					isLeading={homeTeam.score > awayTeam.score}
					gameStatusCode={game.statusCode}
				/>
			</div>
			<GameStatus
				statusCode={game.statusCode}
				statusText={game.statusText}
				dateTimeUTC={game.dateTimeUTC}
				nationalBroadcaster={game.nationalBroadcaster}
			/>
		</div>
	);
}

function Team({
	teamId,
	teamName,
	conference,
	conferenceRank,
	score,
	record,
	isLeading,
	gameStatusCode,
}: TeamProps) {
	return (
		<div className="flex justify-start space-x-4 w-40">
			<div className="flex items-center gap-1">
				<div className="w-2">
					{gameStatusCode === 3 && isLeading && (
						<ChevronRight size={16} />
					)}
				</div>
				<div className="relative">
					<Link href={`/team/${teamId}`}>
						<TeamLogo teamId={teamId} size={48} />
					</Link>
					<span
						className={`absolute backdrop-blur bottom-0 right-0 z-10 text-foreground text-xs font-mono leading-none w-4 aspect-square rounded-sm flex items-center justify-center ${
							conference === "East"
								? "bg-indigo-600/50 dark:bg-blue-800/50"
								: "bg-red-600/50 dark:bg-red-800/50"
						}`}
					>
						{conferenceRank}
					</span>
				</div>
			</div>
			<div className="flex flex-col items-start">
				<p
					className={`text-xl md:text-2xl flex items-center gap-2 ${
						gameStatusCode === 3 && !isLeading
							? "text-muted-foreground"
							: "text-foreground"
					}`}
				>
					{gameStatusCode == 1 ? (
						<span className="font-extralight whitespace-nowrap">
							{record}
						</span>
					) : (
						<span className="font-medium">{score}</span>
					)}
				</p>
				<div className="flex items-center gap-2">
					<p className="text-muted-foreground text-xs md:text-sm">
						{teamName}
					</p>
				</div>
			</div>
		</div>
	);
}

function GameStatus({
	statusCode,
	statusText,
	dateTimeUTC,
	nationalBroadcaster,
}: GameStatusProps) {
	return (
		<div
			className={cn(
				"flex flex-row justify-center w-full gap-2 mt-2 items-end text-sm text-right whitespace-nowrap",
				"md:flex-col md:mt-0"
			)}
		>
			<div
				className={cn(
					"flex items-center px-2 py-0.5 bg-foreground/20 text-foreground border-foreground/30 border rounded-full",
					statusCode === 2
						? "bg-red-500/20 text-red-500 border-red-500/30"
						: "bg-foreground/20 text-foreground border-foreground/30"
				)}
			>
				{statusCode === 1 ? (
					<p>{format(new Date(dateTimeUTC + "Z"), "h:mm a")}</p>
				) : statusCode === 2 ? (
					<div className="flex items-center space-x-3">
						<div className="relative flex items-center justify-center w-2 h-2 bg-red-500/20 rounded-full animate-pulse">
							<div className="w-1.5 h-1.5 bg-red-500/50 rounded-full animate-pulse"></div>
						</div>
						<p>{statusText}</p>
					</div>
				) : (
					<p>{statusText}</p>
				)}
			</div>
			{nationalBroadcaster && (
				<div className="flex items-center px-2 py-0.5 bg-muted-foreground/20 text-accent-foreground border-muted-foreground/30 border rounded-full">
					<p className="text-muted-foreground">
						{nationalBroadcaster}
					</p>
				</div>
			)}
		</div>
	);
}

export default GameCard;
