import Image from "next/image";
import { teamLogoURL } from "@/lib/image-urls";
import { formatISODurationToProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Duration } from 'luxon'

import { Skeleton } from "@/components/ui/skeleton";

interface GameChipProps {
	game?: any;
    loading?: boolean;
}

export function GameChip({ game, loading }: GameChipProps) {
	if (loading) {
		return <Skeleton className="w-full h-[76px] rounded-xl" />;
	}

	const winner =
		game.team_home_score > game.team_away_score
			? "home"
			: game.team_away_score > game.team_home_score
			? "away"
			: "tied";

	return (
		<div
			className={`w-full border rounded-xl p-2 flex justify-between ${
				game.status_code == 1 ? "border-muted"
				: game.status_code == 2 ? "bg-muted/40 border-red-500/40"
				: game.status_code == 3 ? ""
				: "border-red-500"
			}`}
		>
			{/* Teams on the left */}
			<div className="flex flex-col gap-2">
				{[
					{
						team: game.away_team,
						score: game.team_away_score,
						type: "away",
					},
					{
						team: game.home_team,
						score: game.team_home_score,
						type: "home",
					},
				].map((teamData) => (
					<div key={teamData.team.id} className="flex items-center gap-2">
						<Image
							src={teamLogoURL(teamData.team.id)}
							alt={teamData.team.name}
							width={36}
							height={36}
						/>
						<div className="flex flex-col items-start">
							<span
								className={`text-2xl leading-none ${
									winner === teamData.type
										? "font-semibold"
										: winner !== teamData.type && winner !== "tied"
										? "text-muted-foreground"
										: ""
								}`}
							>
								{game.status_code > 1 && teamData.score}
							</span>
							<span className="text-xs text-muted-foreground">
								{teamData.team.name}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* Game info on right */}

			<div className="flex flex-col">
				{<p className="text-sm text-muted-foreground">{game.status_text}</p>}
			</div>
		</div>
	);
}
