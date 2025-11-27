// components/GridComponent.tsx
"use client";

import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { themeBalham, colorSchemeDark } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export function PlayerRankingsTable({ gamePlayers }: { gamePlayers: any[] }) {
	const [rowData, setRowData] = useState<any[]>([]);

	const [columnDefs, setColumnDefs] = useState<ColDef[]>([
		{
			headerName: "Player",
			field: "player",
			pinned: "left",
			sortable: true,
			minWidth: 220,
			flex: 1,
			valueGetter: (params) => {
				const p = params.data;
				return {
					name: `${p.first_name} ${p.last_name}`,
					team: p.team.tricode,
					starter: p.starter,
				};
			},

			cellRenderer: (props) => {
				const { name, team, starter } = props.value;

				return (
					<span className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<span>{name}</span>
							<span className="text-muted-foreground text-xs">
								{team}
							</span>
						</div>
						{starter && (
							<div className="text-xs leading-none text-muted-foreground">
								S
							</div>
						)}
					</span>
				);
			},
		},

		// Classic box score
		{ headerName: "PTS", field: "points", sortable: true, width: 60 },
		{
			headerName: "REB",
			field: "rebounds_total",
			sortable: true,
			width: 60,
		},
		{ headerName: "AST", field: "assists", sortable: true, width: 60 },
		{ headerName: "STL", field: "steals", sortable: true, width: 60 },
		{ headerName: "BLK", field: "blocks", sortable: true, width: 60 },
		{ headerName: "TOV", field: "turnovers", sortable: true, width: 60 },

		// Shooting percentages
		{
			headerName: "3P%",
			sortable: true,
			valueGetter: (params) => {
				const p = params.data;
				return {
					made: p.three_pointers_made,
					attempted: p.three_pointers_attempted,
					pct: (p.three_pointers_percentage * 100).toFixed(1),
				};
			},

			cellRenderer: (props) => {
				const { made, attempted, pct } = props.value;

				return (
					<span className="flex items-center gap-2">
						<span>
							{made}/{attempted}
						</span>
						<span className="text-gray-400 text-xs ml-1">
							({pct}%)
						</span>
					</span>
				);
			},

			width: 120,
		},
		{
			headerName: "FT%",
			sortable: true,
			width: 120,

			valueGetter: (params) => {
				const p = params.data;
				return {
					made: p.free_throws_made,
					attempted: p.free_throws_attempted,
					pct: p.free_throws_percentage
						? (p.free_throws_percentage * 100).toFixed(1)
						: "0.0",
				};
			},

			cellRenderer: (props) => {
				const { made, attempted, pct } = props.value;
				return (
					<span>
						<span>
							{made}/{attempted}
						</span>
						<span className="text-gray-400 text-xs ml-1">
							({pct}%)
						</span>
					</span>
				);
			},
		},
		{
			headerName: "FG%",
			sortable: true,
			width: 120,

			valueGetter: (params) => {
				const p = params.data;
				return {
					made: p.field_goals_made,
					attempted: p.field_goals_attempted,
					pct: p.field_goals_percentage
						? (p.field_goals_percentage * 100).toFixed(1)
						: "0.0",
				};
			},

			cellRenderer: (props) => {
				const { made, attempted, pct } = props.value;
				return (
					<span>
						<span>
							{made}/{attempted}
						</span>
						<span className="text-gray-400 text-xs ml-1">
							({pct}%)
						</span>
					</span>
				);
			},
		},

		// Fantasy points
		{
			headerName: "FP",
			field: "fp",
			sortable: true,
			sort: "desc",
			width: 60,
			cellRenderer: (props) => {
				return <span className="font-bold">{props.value}</span>;
			},
		},
	]);

	useEffect(() => {
		// fetch("https://www.ag-grid.com/example-assets/olympic-winners.json") // Fetch data from server
		// 	.then((result) => result.json()) // Convert to JSON
		// 	.then((rowData) => setRowData(rowData)); // Update state of `rowData`
		gamePlayers.sort();
		setRowData(gamePlayers);
	}, [gamePlayers]);

	return (
		<div style={{ width: "100%", height: "80vh" }}>
			<AgGridReact
				gridId="rankings"
				rowData={rowData}
				columnDefs={columnDefs}
				theme={themeBalham.withPart(colorSchemeDark)}
			/>
			{/* <pre>{JSON.stringify(gamePlayers, null, 2)}</pre> */}
		</div>
	);
}
