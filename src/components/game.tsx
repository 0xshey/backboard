"use client";
import { Game } from "@/lib/types";
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

function GameCard({ game }: { game: Game }) {
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
			className={`flex flex-row justify-between space-x-4 py-4 pr-4 rounded-xl shadow border ${
				game.statusCode == 2 ? "border-red-500" : ""
			}`}
		>
			<div className="flex flex-col gap-4 items-between">
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
		<div className="flex space-x-2">
			<div className="flex items-center gap-1">
				<div className="w-4">
					{gameStatusCode === 3 && isLeading && (
						<ChevronRight size={16} />
					)}
				</div>
				<div className="relative">
					<TeamLogo teamId={teamId} />
					<span
						className={`absolute backdrop-blur bottom-0 right-0 z-10 text-foreground text-[0.65rem] font-mono leading-none w-4 aspect-square rounded-full flex items-center justify-center ${
							conference === "East"
								? "bg-indigo-600/50 dark:bg-blue-900/50"
								: "bg-red-600/50 dark:bg-red-900/50"
						}`}
					>
						{conferenceRank}
					</span>
				</div>
			</div>
			<div className="flex flex-col items-start">
				<p
					className={`text-2xl flex items-center gap-2 ${
						gameStatusCode === 3 && !isLeading
							? "text-muted-foreground"
							: "text-foreground"
					}`}
				>
					{gameStatusCode == 1 ? (
						<span className="font-extralight">{record}</span>
					) : (
						<span className="font-medium">{score}</span>
					)}
				</p>
				<div className="flex items-center gap-2">
					<p className="text-muted-foreground text-xs">{teamName}</p>
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
		<div className="flex flex-col space-y-2 items-end">
			{statusCode === 1 ? (
				<p>{format(new Date(dateTimeUTC + "Z"), "h:mm a")}</p>
			) : statusCode === 2 ? (
				<div className="flex items-center space-x-3">
					<div className="relative flex items-center justify-center w-4 h-4 bg-red-500/20 rounded-full animate-pulse">
						<div className="w-1.5 h-1.5 bg-red-500/50 rounded-full animate-pulse"></div>
					</div>
					<p>{statusText}</p>
				</div>
			) : (
				<p className="">{statusText}</p>
			)}
			<p className="text-muted-foreground text-sm">
				{nationalBroadcaster}
			</p>
		</div>
	);
}

export default GameCard;
