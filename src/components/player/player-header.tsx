import Image from "next/image";
import { playerHeadshotURL } from "@/lib/image-urls";
import { formatSecondsToMMSS } from "@/lib/utils";
import type { Player, GamePlayer } from "@/types";

import { DotIcon } from "lucide-react";

export function PlayerHeader({
	player,
	gamePlayerRows,
}: {
	player: Player;
	gamePlayerRows: GamePlayer[];
}) {
	const totalGames = gamePlayerRows.length;
	const playedGames = gamePlayerRows.filter((gp) => gp.played === true); // use this for calculating averages
	const totalPlayed = playedGames.length;

	// Define the stat keys and labels once
	const statKeys = [
		{ key: "points", label: "PTS" },
		{ key: "rebounds_total", label: "REB" },
		{ key: "assists", label: "AST" },
		{ key: "steals", label: "STL" },
		{ key: "blocks", label: "BLK" },
		{ key: "turnovers", label: "TOV" },
		{ key: "fp", label: "FP" },
	];

	// Compute averages dynamically for all keys
	const averages = Object.fromEntries(
		statKeys.map(({ key }) => [
			key,
			playedGames.length > 0
				? parseFloat(
						(
							playedGames.reduce(
								(sum: number, gp: any) => sum + (gp[key] ?? 0),
								0
							) / playedGames.length
						).toFixed(1)
				  )
				: 0,
		])
	) as Record<string, number>;

	const averageSeconds =
		playedGames.length > 0
			? playedGames.reduce((sum, gp) => sum + (gp.seconds ?? 0), 0) /
			  playedGames.length
			: 0;

	return (
		<div className="w-full max-w-xl grid grid-cols-1 items-center gap-2 mb-12 p-2 rounded-2xl overflow-clip">
			{/* Headshot */}
			<div className="col-span-1 grid grid-cols-9 items-center">
				<div className="col-span-2 flex justify-center">
					<Image
						src={playerHeadshotURL(player.id)}
						width={80}
						height={80}
						alt={player.id}
					/>
				</div>

				<div className="w-full col-span-7 flex gap-2 justify-between">
					{/* Player Info */}
					<div className="flex flex-col items-start gap-1 justify-start ml-2">
						<h1 className="leading-none font-semibold text-xl whitespace-nowrap">
							{player.first_name} {player.last_name}
						</h1>
						<div className="flex items-center gap-0.5 text-xs text-muted-foreground whitespace-nowrap">
							<p>#{player.jersey_number}</p>
							<DotIcon size={12} />
							<p>{player.team.name}</p>
							<DotIcon size={12} />
							<p>{player.country}</p>
							<DotIcon size={12} />
							<p>{player.college}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="w-full flex flex-col items-start gap-2">
				{/* Stat Averages Section */}
				<div className="w-full grid grid-cols-9 gap-0.5 rounded-xl text-xs">
					{/* Games Played */}
					<div className="col-span-1 flex flex-col items-center justify-center rounded-b-lg p-1 gap-1 bg-transparent">
						<p className="text-[0.55rem] font-medium text-muted-foreground leading-none">
							GP
						</p>
						<p className="font-semibold text-sm leading-none text-muted-foreground">
							{totalPlayed}/{totalGames}
						</p>
					</div>
					{/* Minutes */}
					<div className="col-span-1 flex flex-col items-center justify-center rounded-b-lg p-1 gap-1 bg-transparent">
						<p className="text-[0.55rem] font-medium text-muted-foreground leading-none">
							MIN
						</p>
						<p className="font-semibold text-sm leading-none text-muted-foreground">
							{formatSecondsToMMSS(averageSeconds)}
						</p>
					</div>

					{statKeys.map(({ key, label }) => (
						<div
							key={key}
							className={`col-span-1 flex flex-col items-center justify-center rounded-b-lg p-1 gap-1 ${
								key == "fp"
									? "bg-linear-to-t from-purple-500/50 to-transparent"
									: "bg-transparent"
							}`}
						>
							<p className="text-[0.55rem] font-medium text-muted-foreground leading-none">
								{label}
							</p>
							<p className="font-semibold text-sm leading-none">
								{averages[key].toFixed(1)}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
