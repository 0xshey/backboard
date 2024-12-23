import {
	Table,
	TableHeader,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function GamesPanel({ games, loading, error }) {
	if (loading) {
		return <Skeleton className="w-full max-w-xl h-40" />;
	}

	return (
		<div className="w-full max-w-xl p-4 border rounded">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="text-right">Away</TableHead>
						<TableHead className="text-left">Home</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{games.map((game) => (
						<TableRow key={game.id}>
							<TableCell>
								<div
									className={`flex items-center gap-1 w-full justify-end`}
								>
									<p
										className={`${
											game.awayTeamGame.score >
											game.homeTeamGame.score
												? "underline"
												: ""
										}`}
									>
										{game.awayTeam.name}
									</p>
									<p className="font-bold">
										{game.awayTeamGame.score}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<div
									className={`flex items-center gap-1 w-full justify-start`}
								>
									<p className="font-bold">
										{game.homeTeamGame.score}
									</p>
									<p
										className={`${
											game.homeTeamGame.score >
											game.awayTeamGame.score
												? "underline"
												: ""
										}`}
									>
										{game.homeTeam.name}
									</p>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* <pre>{JSON.stringify(games, null, 2)}</pre> */}
		</div>
	);
}
