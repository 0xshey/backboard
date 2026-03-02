import { ScheduleGrid } from "./schedule-grid";

export default function SchedulePage() {
	return (
		<div className="w-full max-w-6xl px-2 pb-12">
			<div className="mb-6 mt-12 px-2 space-y-1">
				<h1 className="text-4xl font-semibold">Schedule</h1>
				<p className="text-sm text-muted-foreground">
					NBA game calendar by Yahoo fantasy week.
				</p>
			</div>
			<ScheduleGrid />
		</div>
	);
}
