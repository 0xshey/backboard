"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PlayerGameRow } from "@/lib/types";
import { parseDuration } from "@/lib/utils";

import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

import TeamLogo from "@/components/nba/team-logo";

export const columns: ColumnDef<PlayerGameRow>[] = [
	{
		header: "Player",
		accessorFn: (player) => player,
		cell: (props) => {
			return (
				<div className="flex items-center gap-1">
					<TeamLogo
						teamId={props.row.original.team.id}
						size={18}
						className="md:hidden"
					/>
					<TeamLogo
						teamId={props.row.original.team.id}
						size={20}
						className="hidden md:inline"
					/>
					<span className="ml-1 max-w-20 md:max-w-none whitespace-nowrap truncate">
						{props.row.original.firstName.charAt(0)}.{" "}
						{props.row.original.lastName}
					</span>
				</div>
			);
		},
	},
	{
		accessorFn: (player) => `${parseDuration(player.minutes)}`,
		header: "MIN",
	},
	{
		accessorKey: "points",
		header: "PTS",
	},
	{
		accessorKey: "reboundsTotal",
		header: "REB",
	},
	{
		accessorKey: "assists",
		header: "AST",
	},
	{
		accessorKey: "steals",
		header: "STL",
	},
	{
		accessorKey: "blocks",
		header: "BLK",
	},
	{
		accessorKey: "turnovers",
		header: "TOV",
	},
	{
		accessorKey: "fp",
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
						className="px-1"
					>
						<span>δ</span>
						{column.getIsSorted() === "asc" ? (
							<ArrowUp size={12} />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown size={12} />
						) : (
							<ArrowUpDown size={12} />
						)}
					</Button>
				</div>
			);
		},
		cell: (props) => {
			return <div>{props.row.original.fp.toFixed(2)}</div>;
		},
	},
	{
		accessorKey: "fpDelta",
		header: ({ column }) => {
			return (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === "asc")
						}
						className="px-1"
					>
						<span>δ</span>
						{column.getIsSorted() === "asc" ? (
							<ArrowUp size={12} />
						) : column.getIsSorted() === "desc" ? (
							<ArrowDown size={12} />
						) : (
							<ArrowUpDown size={12} />
						)}
					</Button>
				</div>
			);
		},
		cell: (props) => {
			return (
				<div>
					{props.row.original.fpDelta > 0 ? "+" : ""}
					{props.row.original.fpDelta}
				</div>
			);
		},
	},
];
