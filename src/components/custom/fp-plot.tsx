import React, { PureComponent } from "react";
import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

export default class FpPlot extends PureComponent<{ players: any[] }> {
	render() {
		const { players } = this.props;
		return (
			<div className="flex flex-col items-center gap-4">
				<ResponsiveContainer width="100%" height={400}>
					<ScatterChart
						margin={{
							top: 10,
							right: 10,
							bottom: 0,
							left: 5,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							type="number"
							dataKey="fpDelta"
							name="Season Avg. Diff."
							unit="FP"
						/>
						<YAxis
							type="number"
							dataKey="fp"
							name="Fantasy Points"
							unit="FP"
						/>
						<Tooltip cursor={{ strokeDasharray: "3 3" }} />
						<Scatter
							name="Fantasy Performers"
							data={players}
							fill="#8884d8"
						/>
					</ScatterChart>
				</ResponsiveContainer>
			</div>
		);
	}
}
