"use client";
import React, { PureComponent } from "react";
import { valueToRGB } from "@/lib/utils";
import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Label,
	ReferenceLine,
	Dot,
	DotProps,
} from "recharts";
import { FantasyPlayer } from "@/lib/types";
import PlayerHeadshot from "@/components/nba/player-headshot";

export class FantasyScatter extends PureComponent<{
	data: { fantasyPoints: number; fantasyPointsDelta: number }[];
}> {
	render() {
		function RenderDot({ cx, cy }: DotProps) {
			return <Dot cx={cx} cy={cy} fill="gray" r={4} />;
		}

		return (
			<ResponsiveContainer width="100%" height={600} className="">
				<ScatterChart
					margin={{
						top: 5,
						right: 20,
						bottom: 60,
						left: 0,
					}}
				>
					<CartesianGrid fillOpacity={0.5} strokeOpacity={0.1} />
					<ReferenceLine x={0} stroke="gray" opacity={0.6} />
					<XAxis
						type="number"
						dataKey="fantasyPointsDelta"
						name="today"
						unit="fp"
						axisLine={false}
						tickLine={false}
						tickMargin={10}
						fontSize={12}
						minTickGap={5}
						tickCount={9}
						tickFormatter={(value) =>
							(value > 0 ? "+" : "") + value
						}
					>
						<Label
							value="Underperforming ← Deviation from Season Average → Overperforming"
							position="bottom"
							offset={24}
							fontSize={12}
						/>
					</XAxis>

					<YAxis
						// yAxisId="left"
						// orientation="left"
						type="number"
						dataKey="fantasyPoints"
						name="relative"
						unit="fp"
						axisLine={false}
						tickLine={false}
						tickMargin={5}
						fontSize={12}
						tickCount={8}
					>
						<Label
							value="FP"
							position="left"
							angle={-90}
							offset={-50}
							fontSize={12}
							textAnchor="middle"
						/>
					</YAxis>
					<Tooltip
						cursor={{ strokeDasharray: "4 4", opacity: 0.5 }}
						content={<PlayerTooltip />}
					/>
					<Scatter
						name="Daily Performers"
						data={this.props.data}
						fill="#8884d8"
						// shape="cross"
						shape={<RenderDot />}
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
					<div className="grid grid-cols-6 text-center text-[0.65rem]">
						<div className="p-0.5 text-xs font-medium">
							{player.points}
						</div>
						<div className="p-0.5 text-xs font-medium">
							{player.reboundsTotal}
						</div>
						<div className="p-0.5 text-xs font-medium">
							{player.assists}
						</div>
						<div className="p-0.5 text-xs font-medium">
							{player.steals}
						</div>
						<div className="p-0.5 text-xs font-medium">
							{player.blocks}
						</div>
						<div className="p-0.5 text-xs font-medium">
							{player.turnovers}
						</div>

						<div className="p-0.5 text-[0.6rem] text-muted-foreground">
							PTS
						</div>
						<div className="p-0.5 text-[0.6rem] text-muted-foreground">
							REB
						</div>
						<div className="p-0.5 text-[0.6rem] text-muted-foreground">
							AST
						</div>
						<div className="p-0.5 text-[0.6rem] text-muted-foreground">
							STL
						</div>
						<div className="p-0.5 text-[0.6rem] text-muted-foreground">
							BLK
						</div>
						<div className="p-0.5 text-[0.6rem] text-muted-foreground">
							TOV
						</div>
					</div>
				</div>
				<div className="flex flex-col items-center justify-center min-h-full p-2 aspect-square">
					<div className="p-0.5 text-xl font-semibold">
						{player.fantasyPoints}
					</div>
					<div
						className="text-xs px-1 rounded border"
						style={{
							backgroundColor: valueToRGB(
								(player.fantasyPointsDelta + 30) / 60
							)
								.replace("rgb", "rgba")
								.replace(")", ", 0.1)"),
							color: valueToRGB(
								(player.fantasyPointsDelta + 30) / 60
							),
							borderColor: valueToRGB(
								(player.fantasyPointsDelta + 30) / 60
							),
						}}
					>
						{player.fantasyPointsDelta > 0 ? "+" : ""}
						{player.fantasyPointsDelta}
					</div>
					<p className="text-xs text-muted-foreground pt-0.5">FP</p>
				</div>
			</div>
		);
	}

	return null;
}
