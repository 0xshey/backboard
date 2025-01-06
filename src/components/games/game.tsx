"use client";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import TeamLogo from "@/components/nba/team-logo";

interface GameProps {
	game: {
		gameId: string;
		homeTeamId: string;
		homeTeamName: string;
		homeTeamScore: number;
		homeTeamWins: number;
		homeTeamLosses: number;

		awayTeamId: string;
		awayTeamName: string;
		awayTeamScore: number;
		awayTeamWins: number;
		awayTeamLosses: number;

		statusCode: number;
		dateTimeUTC: string;
		statusText: string;
		nationalBroadcaster: string;
	};
}

interface GameStatusProps {
	statusCode: number;
	statusText: string;
	dateTimeUTC: string;
	nationalBroadcaster: string;
}

interface TeamProps {
	teamId: string;
	teamName: string;
	score: number;
	record: string;
	isLeading: boolean;
	gameStatusCode: number;
}

function Game({ game }: GameProps) {
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
					score={awayTeam.score}
					record={`${game.awayTeamWins}-${game.awayTeamLosses}`}
					isLeading={awayTeam.score > homeTeam.score}
					gameStatusCode={game.statusCode}
				/>
				<Team
					teamId={homeTeam.teamId}
					teamName={homeTeam.teamName}
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
				<TeamLogo teamId={teamId} />
			</div>
			<div className="flex flex-col items-start">
				<p
					className={`text-xl flex items-center gap-2 ${
						gameStatusCode === 3 && !isLeading
							? "text-muted-foreground"
							: "text-foreground"
					}`}
				>
					{gameStatusCode == 1 ? (
						<span className="font-light">{record}</span>
					) : (
						<span className="font-semibold">{score}</span>
					)}
				</p>
				<p className="text-muted-foreground text-sm">{teamName}</p>
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
				<p>{format(new Date(dateTimeUTC), "h:mm a")}</p>
			) : statusCode === 2 ? (
				<div className="flex items-center space-x-3">
					<div className="relative flex items-center justify-center w-4 h-4 bg-red-500/20 rounded-full animate-pulse">
						<div className="absolute inset-0 w-1.5 h-1.5 bg-red-500/50 rounded-full animate-pulse"></div>
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

export default Game;
