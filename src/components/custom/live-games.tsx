import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import TeamLogo from "@/components/nba/team-logo";
import { Skeleton } from "../ui/skeleton";

export default function LiveGames({
	games,
	loading = false,
}: {
	games: any;
	loading?: boolean;
}) {
	let anyGameHasStarted = false;

	if (games) {
		anyGameHasStarted = games.some((game) => game.statusCode > 1);
	}

	return (
		<>
			{/* Games */}
			{loading ? (
				<div className="flex flex-col items-center gap-4 max-w-lg w-full px-4">
					<Skeleton className="w-full min-w-80 h-40" />
					<Skeleton className="w-full min-w-80 h-40" />
					<Skeleton className="w-full min-w-80 h-40" />
				</div>
			) : !games ? (
				<p>No games today</p>
			) : !anyGameHasStarted ? (
				<div className="flex flex-col items-center gap-4 max-w-lg w-full px-4">
					{games.map((game) => (
						<GameCard key={game.id} game={game} />
					))}
				</div>
			) : (
				<div className="w-full flex gap-2 items-center overflow-x-scroll no-scrollbar border-b px-2 py-4 ">
					{games.map((game) => (
						<GameCard key={game.id} game={game} />
					))}
				</div>
			)}
		</>
	);
}

export function GameCard({
	game,
	className,
}: {
	game: any;
	className?: string;
}) {
	return (
		<Card
			key={game.id}
			className={cn(
				"w-full min-w-80 p-4 flex justify-between gap-2 group",
				className,
				{
					"bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(255,0,0,0.20)_0%,rgba(255,255,255,0.00)_100%)]":
						game.statusCode == 2,
					"bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(0,0,0,0.20)_0%,rgba(255,255,255,0.00)_100%)] dark:bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.00)_100%)]":
						game.statusCode == 3,
				}
			)}
		>
			<div
				id="teams"
				className="flex flex-col gap-4 whitespace-nowrap items-start"
			>
				{["homeTeam", "awayTeam"].map((team) => (
					<div key={team.id} className="flex items-center gap-2">
						<TeamLogo teamId={game[team].id} size={48} />
						<div className="flex flex-col">
							{game.statusCode == 1 ? (
								<span className="text-xl font-light">
									{game[team].record}
								</span>
							) : (
								<div className="flex items-center gap-6">
									<p
										className={`text-xl min-w-8 ${
											game[team].score >
											game[
												team === "homeTeam"
													? "awayTeam"
													: "homeTeam"
											].score
												? "font-semibold"
												: "font-light"
										}`}
									>
										{game[team].score}
									</p>
									<div className="grid grid-flow-col gap-2 text-foreground-muted">
										{game[team].linescore
											.slice(0, game.livePeriod)
											.map((score, i) => (
												<div
													key={i}
													className="flex-col items-center flex"
												>
													<p className="text-[0.5rem] text-foreground-muted">
														{game.livePeriod <= 4
															? "Q"
															: "OT"}
														{game.livePeriod <= 4
															? i + 1
															: i - 4}
													</p>
													<p
														className={`text-xs ${
															game[team]
																.linescore[i] >
															game[
																team ===
																"homeTeam"
																	? "awayTeam"
																	: "homeTeam"
															].linescore[i]
																? "font-semibold"
																: "font-light"
														}`}
													>
														{score}
													</p>
												</div>
											))}
									</div>
								</div>
							)}
							<span className="text-xs text-foreground-muted">
								{game[team].name}
							</span>
						</div>
					</div>
				))}
			</div>
			{/* Game Info */}
			<div
				id="game-info"
				className="flex flex-col items-end justify-start"
			>
				<div className="flex items-center gap-3">
					{game.statusCode == 2 ? (
						<div className="flex items-center gap-2">
							<p className="text-xs text-foreground-muted flex items-center gap-1 ">
								<p>
									{game.livePeriod <= 4 ? "Q" : "OT"}
									{game.livePeriod}
								</p>
								<p>{game.liveClock}</p>
							</p>
							<div className="w-4 h-4 rounded-full bg-red-500/20 animate-pulse flex items-center justify-center">
								<div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
							</div>
						</div>
					) : (
						<p className="font-medium whitespace-nowrap">
							{game.statusText}
						</p>
					)}
				</div>
			</div>
		</Card>
	);
}
