"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StandingsRow } from "@/lib/types";

import TeamLogo from "@/components/nba/team-logo";

export const columns: ColumnDef<StandingsRow>[] = [
	{
		header: "Team",
		accessorFn: (player) => player,
		cell: (props) => {
			const row = props.row.original;

			return (
				<div className="flex items-center gap-1">
					<TeamLogo teamId={row.team.id} size={20} />
					<span className="ml-1 max-w-20 md:min-w-48 whitespace-nowrap truncate">
						{row.team.name}
					</span>
				</div>
			);
		},
	},
	{
		header: "GP",
		accessorKey: "gamesPlayed",
	},
	{
		header: "Record",
		accessorFn: (player) => player,
		cell: (props) => {
			const row = props.row.original;

			return (
				<div className="flex items-center gap-1 font-mono">
					<span>{row.wins}</span>
					<span>-</span>
					<span>{row.losses}</span>
				</div>
			);
		},
	},
	{
		header: "%",
		accessorFn: (player) => player,
		cell: (props) => {
			const row = props.row.original;

			return (
				<span
					className={`${
						row.wins / (row.wins + row.losses) >= 0.6
							? "text-green-500"
							: row.wins / (row.wins + row.losses) <= 0.4
							? "text-red-500"
							: "text-amber-500"
					}`}
				>
					{(row.wins / (row.wins + row.losses)).toFixed(3).slice(1)}
				</span>
			);
		},
	},
	{
		header: "Home",
		accessorKey: "homeRecord",
	},
	{
		header: "Away",
		accessorKey: "awayRecord",
	},
];
