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
import { FantasyPlayer } from "@/lib/types";
import PlayerHeadshot from "@/components/nba/player-headshot";

export class FantasyScatter extends PureComponent<{
	data: { fantasyPoints: number; fantasyPointsDelta: number }[];
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
						dataKey="fantasyPoints"
						name="today"
						unit="fp"
						axisLine={false}
						tickLine={false}
						tickMargin={10}
						fontSize={12}
						minTickGap={5}
						tickCount={9}
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
						dataKey="fantasyPointsDelta"
						name="relative"
						unit="fp"
						axisLine={false}
						tickLine={false}
						tickMargin={10}
						fontSize={12}
						tickCount={8}
					>
						<Label
							value="Deviation from Season Average"
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
						shape="cross"
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
		payload: FantasyPlayer;
	}[];
	// label?: string;
};

function PlayerTooltip({ active, payload }: PlayerTooltipProps) {
	if (active && payload) {
		const player = payload[0].payload;
		return (
			<div className="custom-tooltip bg-card text-card-foreground shadow rounded border flex items-center justify-between gap-2">
				<div className="ml-1 border-b ">
					<PlayerHeadshot
						playerId={String(player.playerId)}
						size={96}
						className="p"
					/>
				</div>
				<div className="p-2">
					<p className="name text-lg mb-2 font-semibold flex items-center gap-1">
						<span>
							{player.firstName} {player.lastName}
						</span>
						{/* <span className="text-muted-foreground hidden">
							{label}
						</span> */}
					</p>
					<div className="grid grid-cols-6 text-center text-muted-foreground text-xs">
						<div className="p-0.5 font-bold">PTS</div>
						<div className="p-0.5 font-bold">REB</div>
						<div className="p-0.5 font-bold">AST</div>
						<div className="p-0.5 font-bold">STL</div>
						<div className="p-0.5 font-bold">BLK</div>
						<div className="p-0.5 font-bold">TOV</div>
						<div className="p-0.5">{player.points}</div>
						<div className="p-0.5">{player.reboundsTotal}</div>
						<div className="p-0.5l">{player.assists}</div>
						<div className="p-0.5l">{player.steals}</div>
						<div className="p-0.5l">{player.blocks}</div>
						<div className="p-0.5l">{player.turnovers}</div>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center min-h-full p-2 aspect-square">
					<p className="text-xs text-muted-foreground">FP</p>
					<div className="p-0.5 text-xl font-semibold">
						{player.fantasyPoints}
					</div>
					<div
						className={`text-sm px-1 rounded ${
							player.fantasyPointsDelta > 0
								? "bg-green-500"
								: "bg-red-500"
						}`}
					>
						{player.fantasyPointsDelta > 0 ? "+" : ""}
						{player.fantasyPointsDelta}
					</div>
				</div>
			</div>
		);
	}

	return null;
}
