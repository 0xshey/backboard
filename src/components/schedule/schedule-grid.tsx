"use server";
import Image from "next/image";
import type { Game, GameWeekFantasy, Team } from "@/types";
import { teamLogoURL } from "@/lib/image-urls";
import { AtSign } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { get } from "http";

export async function ScheduleGrid({
	fantasyGameWeek,
	gamesByTeam,
	teams,
}: {
	fantasyGameWeek: GameWeekFantasy;
	gamesByTeam: Record<string, Game[]>;
	teams: Team[];
}) {
	function getDatesFromRange(startDate: string, endDate: string): string[] {
		const start = new Date(`${startDate}T00:00:00`);
		const end = new Date(`${endDate}T00:00:00`);
		const dates: string[] = [];

		const fmt = new Intl.DateTimeFormat("en-CA", {
			timeZone: "America/New_York",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});

		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			dates.push(fmt.format(d));
		}

		return dates; // <-- plain array, no promise
	}

	// Utiltiy functions
	const datesInWeek = getDatesFromRange(
		fantasyGameWeek.start_date!,
		fantasyGameWeek.end_date!
	);

	function formatShortDateFromString(dateString: string) {
		// Parse without timezone conversion
		const [y, m, d] = dateString.split("-").map(Number);
		const date = new Date(y, m - 1, d); // JS months are 0-indexed

		// Format as "Oct 20"
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
		}).format(date);
	}

	function formatWeekdayFromString(dateString: string) {
		// Parse without timezone conversion
		const [y, m, d] = dateString.split("-").map(Number);
		const date = new Date(y, m - 1, d); // JS months are 0-indexed

		// Format as "Oct 20"
		return new Intl.DateTimeFormat("en-US", {
			weekday: "short",
		}).format(date);
	}

	function formatWeekdayNY(date: Date, opts?: Intl.DateTimeFormatOptions) {
		return new Intl.DateTimeFormat("en-US", {
			// timeZone: "America/New_York",
			weekday: "short",
			...opts,
		}).format(date);
	}

	function getNYDateString(date: Date) {
		const fmt = new Intl.DateTimeFormat("en-CA", {
			timeZone: "America/New_York",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
		return fmt.format(date);
	}

	function getGradientClass(count: number) {
		if (count === 0)
			return "bg-linear-to-l from-red-500/70 to-transparent via-transparent";
		if (count === 1)
			return "bg-linear-to-l from-red-500/40 to-transparent via-transparent";
		if (count === 2)
			return "bg-linear-to-l from-orange-500/40 to-transparent via-transparent";
		if (count === 3)
			return "bg-linear-to-l from-yellow-300/10 to-transparent via-transparent";
		if (count === 4)
			return "bg-linear-to-l from-green-500/40 to-transparent via-transparent";
		return "bg-linear-to-l from-green-500/70 to-transparent via-transparent"; // 5+
	}

	// Subcomponents
	function DateHeader({ dateString }: { dateString: string }) {
		const isToday = getNYDateString(new Date()) === dateString;

		return (
			<div
				className={`flex flex-col items-center rounded text-xs whitespace-nowrap ${
					isToday ? "bg-red-500/20 ring-1 ring-red-500" : ""
				}`}
			>
				<div>{formatWeekdayFromString(dateString)}</div>
				<div className="text-muted-foreground/70">
					{formatShortDateFromString(dateString)}
				</div>
			</div>
		);
	}

	function OpponentCell({ game, teamId }: { game: Game; teamId: string }) {
		if (!game) {
			return null;
		}

		const isAway = game.team_away_id === teamId;

		const opponentId =
			game.team_home_id === teamId
				? game.team_away_id
				: game.team_home_id;

		// Full object instead of string
		const opponent = opponentId
			? teams.find((t) => t.id === opponentId) || null
			: null;

		return opponent ? (
			<div className="relative flex justify-center items-center gap-1 rounded-md cursor-default bg-muted py-1 text-xs overflow-hidden">
				{/* background image (absolute, bigger, translated 50% left) */}
				<Image
					src={teamLogoURL(opponent.id)}
					alt={opponent.name!}
					fill
					className="absolute inset-0 object-cover translate-x-1/3 scale-120 opacity-20 transform"
					sizes="100vw"
				/>
				{/* foreground content */}
				<div className="relative z-10 flex items-center gap-1">
					{isAway ? <AtSign size={12} /> : ""}
					<p className="font-semibold font-mono">
						{opponent.tricode}
					</p>
				</div>
			</div>
		) : null;
		// return <pre>{JSON.stringify(game, null, 2)}</pre>;
	}

	return (
		<div className="w-full overflow-x-scroll">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="min-w-30">Team</TableHead>
						{datesInWeek.map((date) => (
							<TableHead key={date} className="min-w-16">
								<DateHeader dateString={date} />
								{/* {date} */}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{[...teams]
						.sort(
							(a, b) =>
								(gamesByTeam[b.id]?.length ?? 0) -
								(gamesByTeam[a.id]?.length ?? 0)
						)
						.map((team) => {
							const count = gamesByTeam[team.id]?.length ?? 0;
							const gradientClass = getGradientClass(count);

							return (
								<TableRow key={team.id}>
									<TableCell
										className={`flex items-center justify-between text-xs ${gradientClass}`}
									>
										<div>{team.tricode}</div>
										<div className="text-muted-foreground">
											{count}
										</div>
									</TableCell>

									{datesInWeek.map((date) => {
										const game = gamesByTeam[team.id]?.find(
											(g) =>
												getNYDateString(
													new Date(g.datetime!)
												) === date
											// isSameDayNY(
											// 	new Date(g.datetime!),
											// 	new Date(date)
											// )
										);

										return (
											<TableCell
												key={date}
												className="py-0"
											>
												<OpponentCell
													game={game!}
													teamId={team.id}
												/>
											</TableCell>
										);
									})}
								</TableRow>
							);
						})}
				</TableBody>
			</Table>
		</div>
	);
}
