import Image from "next/image";
import type { Game, Team } from "@/types";
import { teamLogoURL } from "@/lib/image-urls";

export function ScheduleGrouped({
	teamsGroupedByGameCount,
	gamesByTeam,
	teams,
}: {
	teamsGroupedByGameCount: { count: number; teams: Team[] }[];
	gamesByTeam: Record<string, Game[]>;
	teams: Team[];
}) {
	// Helper: get opponent team
	const getOpponent = (game: Game, teamId: string) => {
		if (game.team_home_id === teamId) {
			const opp = teams.find((t) => t.id === game.team_away_id);
			return opp ? `vs ${opp.city} ${opp.name}` : "vs Unknown";
		} else {
			const opp = teams.find((t) => t.id === game.team_home_id);
			return opp ? `@ ${opp.city} ${opp.name}` : "@ Unknown";
		}
	};

	return (
		<div className="space-y-8 w-full">
			{teamsGroupedByGameCount.map((group) => (
				<div
					key={group.count}
					className=" w-full flex flex-col items-center"
				>
					<div className="w-fit mb-8 px-4 drop-shadow-xl py-2 flex justify-center sticky top-20 z-20 bg-background/70 backdrop-blur-sm border rounded-xl ">
						<h2 className="text-3xl font-bold min-w-8xl">
							{group.count} Game{group.count !== 1 && "s"} This
							Week
						</h2>
					</div>

					<div className="grid gap-6 md:grid-cols-3 max-w-8xl">
						{group.teams.map((team) => (
							<TeamGamesCard
								key={team.id}
								team={team}
								games={gamesByTeam[team.id] || []}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);

	function TeamGamesCard({ team, games }: { team: Team; games: Game[] }) {
		return (
			<div
				key={team.id}
				className="relative border overflow-hidden bg-muted p-2 rounded"
			>
				<Image
					src={teamLogoURL(team.id)}
					fill
					alt={`${team.name}`}
					className="object-cover object-center opacity-15 max-w-sm -translate-y-10"
				/>

				<h3 className="font-semibold ml-1 mb-1">
					{team.city} {team.name}
				</h3>
				<div className="z-10">
					<ul className="space-y-1">
						{games.map((game) => (
							<div
								key={game.id}
								className="px-2 flex justify-between border rounded bg-muted text-muted-foreground"
							>
								<span>{getOpponent(game, team.id)}</span>
								<span className="text-sm text-muted-foreground">
									{game.datetime
										? new Date(
												game.datetime
										  ).toLocaleString("en-US", {
												weekday: "short",
												month: "short",
												day: "numeric",
												hour: "numeric",
												minute: "2-digit",
										  })
										: "TBD"}
								</span>
							</div>
						))}
					</ul>
				</div>
			</div>
		);
	}
}
