"use client";
import React, { PureComponent } from "react";
import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Label,
} from "recharts";
import { PlayerGameRow } from "@/lib/types";

export class FantasyScatter extends PureComponent<{
	data: { fp: number; fpDelta: number }[];
}> {
	render() {
		return (
			<ResponsiveContainer width="100%" height={800}>
				<ScatterChart
					margin={{
						top: 5,
						right: 20,
						bottom: 5,
						left: 5,
					}}
				>
					<CartesianGrid fillOpacity={0.5} strokeOpacity={0.1} />
					<XAxis
						type="number"
						dataKey="fp"
						name="today"
						unit="fp"
						axisLine={false}
						tickLine={false}
						tickMargin={10}
						fontSize={12}
					>
						<Label
							value="Worse ← Today's FP → Better"
							position="insideBottom"
							offset={42}
							fontSize={12}
						/>
					</XAxis>

					<YAxis
						type="number"
						dataKey="fpDelta"
						name="relative"
						unit="fp"
						axisLine={false}
						tickLine={false}
						tickMargin={10}
						fontSize={12}
					>
						<Label
							value="FPΔ vs Season"
							position="insideLeft"
							angle={-90}
							offset={80}
							fontSize={12}
							textAnchor="middle"
						/>
					</YAxis>
					<Tooltip
						cursor={{ strokeDasharray: "3 3" }}
						content={<PlayerTooltip />}
					/>
					<Scatter
						name="Daily Performers"
						data={this.props.data}
						fill="#8884d8"
						shape="circle"
					/>
				</ScatterChart>
			</ResponsiveContainer>
		);
	}
}

type PlayerTooltipProps = {
	active?: boolean;
	payload?: {
		name: string;
		value: number;
		payload: PlayerGameRow;
	}[];
	label?: string;
};

function PlayerTooltip({ active, payload, label }: PlayerTooltipProps) {
	if (active && payload) {
		const player = payload[0].payload;
		return (
			<div className="custom-tooltip bg-card text-card-foreground shadow rounded border p-2">
				<p className="name text-lg mb-2 font-semibold flex items-center gap-1">
					<span>
						{player.firstName} {player.lastName}
					</span>
					<span className="text-muted-foreground">
						vs. {player.opposingTeam.name} {label}
					</span>
				</p>
				<div className="grid grid-cols-8 text-center text-muted-foreground text-xs">
					<div className="px-0.5 font-bold">PTS</div>
					<div className="px-0.5 font-bold">REB</div>
					<div className="px-0.5 font-bold">AST</div>
					<div className="px-0.5 font-bold">STL</div>
					<div className="px-0.5 font-bold">BLK</div>
					<div className="px-0.5 font-bold">TOV</div>
					<div className="px-0.5 font-bold">FP</div>
					<div className="px-0.5 font-bold">&delta;</div>
					<div className="px-0.5 border-l">{player.points}</div>
					<div className="px-0.5 border-l">
						{player.reboundsTotal}
					</div>
					<div className="px-0.5 border-l">{player.assists}</div>
					<div className="px-0.5 border-l">{player.steals}</div>
					<div className="px-0.5 border-l">{player.blocks}</div>
					<div className="px-0.5 border-l">{player.turnovers}</div>
					<div className="px-0.5 border-l">{player.fp}</div>
					<div className="px-0.5 border-l">
						{player.fpDelta > 0 ? "+" : ""}
						{player.fpDelta}
					</div>
				</div>
			</div>
		);
	}

	return null;
}
