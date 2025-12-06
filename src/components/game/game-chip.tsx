import Image from "next/image";
import { teamLogoURL } from "@/lib/image-urls";
import { formatISODurationToProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Duration } from 'luxon'

interface GameChipProps {
	game: any;
}

export function GameChip({ game }: GameChipProps) {
	const winner =
		game.team_home_score > game.team_away_score
			? "home"
			: game.team_away_score > game.team_home_score
			? "away"
			: "tied";

	return (
		<div
			className={`w-full border rounded-xl p-2 flex justify-between ${
				game.status_code == 2
					? "bg-muted/40 border-red-500/40"
					: game.status_code == 3
					? ""
					: "bg-muted border-muted-foreground"
			}`}
		>
			{/* Teams on the left */}
			<div className="flex flex-col gap-2">
				{/* Away team */}
				<div className="flex items-center gap-2">
					<Image
						src={teamLogoURL(game.away_team.id)}
						alt={game.away_team.name}
						width={30}
						height={30}
					/>
					<span
						className={`text-2xl leading-none ${
							winner === "away"
								? "font-semibold"
								: winner === "home"
								? "text-muted-foreground"
								: ""
						}`}
					>
						{game.status_code > 1 && game.team_away_score}
					</span>
				</div>

				{/* Home team */}
				<div className="flex items-center gap-2">
					<Image
						src={teamLogoURL(game.home_team.id)}
						alt={game.home_team.name}
						width={30}
						height={30}
					/>
					<span
						className={`text-2xl leading-none ${
							winner === "home"
								? "font-semibold"
								: winner === "away"
								? "text-muted-foreground"
								: ""
						}`}
					>
						{game.status_code > 1 && game.team_home_score}
					</span>
				</div>
			</div>

			{/* Game info on right */}

			<div className="flex flex-col">
				{<p className="text-sm text-muted-foreground">{game.status_text}</p>}
			</div>
		</div>
	);
}
