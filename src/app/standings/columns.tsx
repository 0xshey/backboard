"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Standing } from "@/lib/types";
import { parseDuration } from "@/lib/utils";

import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import TeamLogo from "@/components/nba/team-logo";

export const columns: ColumnDef<Standing>[] = [
	{
		header: "Team",
		accessorFn: (team) => team,
		cell: (props) => {
			return (
				<div className="flex items-center gap-1">
					<TeamLogo
						teamId={props.row.original.teamId}
						size={18}
						className="md:hidden"
					/>
					<TeamLogo
						teamId={props.row.original.teamId}
						size={20}
						className="hidden md:inline"
					/>
					<span className="ml-1 max-w-20 md:min-w-48 whitespace-nowrap truncate">
						{props.row.original.teamCity}
					</span>
				</div>
			);
		},
	},
	{
		accessorFn: (team) => `${team.wins}-${team.losses}`,
		header: "W-L",
	},
	{
		accessorFn: (team) => `${team.winPct.toFixed(3).slice(1)}`,
		header: "PCT",
	},
	{
		accessorKey: "l10Record",
		header: "L10",
	},
	{
		accessorFn: (team) => team,
		header: "HOME",
		cell: (props) => {
			const streakClass =
				props.row.original.homeStreak > 0
					? "text-green-500"
					: "text-red-500";
			return (
				<div className="flex items-center gap-1">
					<span>{props.row.original.homeRecord}</span>
					<span className={streakClass}>
						{props.row.original.homeStreak > 0 ? "W" : "L"}
						{Math.abs(props.row.original.homeStreak)}
					</span>
				</div>
			);
		},
	},
	{
		accessorFn: (team) => team,
		header: "AWAY",
		cell: (props) => {
			const streakClass =
				props.row.original.awayStreak > 0
					? "text-green-500"
					: "text-red-500";
			return (
				<div className="flex items-center gap-1">
					<span>{props.row.original.awayRecord}</span>
					<span className={streakClass}>
						{props.row.original.awayStreak > 0 ? "W" : "L"}
						{Math.abs(props.row.original.awayStreak)}
					</span>
				</div>
			);
		},
	},
	{
		accessorFn: (team) =>
			`${(team.pointsFor / team.gamesPlayed).toFixed(1)}`,
		header: "PPG",
	},
	{
		accessorFn: (team) =>
			`${(team.pointsAgainst / team.gamesPlayed).toFixed(1)}`,
		header: "OPPG",
	},
];
