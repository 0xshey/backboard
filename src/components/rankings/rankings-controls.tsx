// /Users/shey/Developer/backboard/backboard/src/components/rankings/rankings-controls.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { PlusIcon, MinusIcon } from "lucide-react";

function todayISO() {
	return new Date().toISOString().slice(0, 10);
}

function addDaysISO(isoDate: string, delta: number) {
	const d = new Date(isoDate + "T00:00:00");
	d.setDate(d.getDate() + delta);
	return d.toISOString().slice(0, 10);
}

export function RankingsControls() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// initial date: use ?date=YYYY-MM-DD or today
	const initialDate = (() => {
		const d = searchParams.get("date");
		if (!d) return todayISO();
		const parsed = new Date(d + "T00:00:00");
		return Number.isFinite(parsed.getTime()) ? d : todayISO();
	})();

	// scoringType default: "all"
	const initialScoringType = searchParams.get("scoringType") ?? "all";

	const [date, setDate] = useState(initialDate);
	const [scoringType, setScoringType] = useState(initialScoringType);

	// keep in sync with back/forward navigation
	useEffect(() => {
		const spDate = searchParams.get("date");
		const spParsed =
			spDate && Number.isFinite(new Date(spDate + "T00:00:00").getTime())
				? spDate
				: todayISO();
		const spScoring = searchParams.get("scoringType") ?? "all";

		setDate(spParsed);
		setScoringType(spScoring);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// push updates to /rankings route (replace to keep history cleaner)
	useEffect(() => {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		// set or remove date
		params.set("date", date);
		// scoringType optional: remove if empty
		if (scoringType) params.set("scoringType", scoringType);
		else params.delete("scoringType");

		const query = params.toString();
		router.replace(query ? `/rankings?${query}` : `/rankings`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [date, scoringType]);

	useEffect(() => {
		const interval = setInterval(() => {
			router.refresh();
		}, 60 * 1000);
		return () => clearInterval(interval);
	}, [router]);

	const decrementDate = () => setDate((d) => addDaysISO(d, -1));
	const incrementDate = () => setDate((d) => addDaysISO(d, 1));

	return (
		<div className="w-full max-w-md mb-10 flex flex-col gap-4">
			<div className="flex gap-8 items-center">
				<Select value={scoringType} onValueChange={setScoringType}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Scoring" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All</SelectItem>
						<SelectItem value="points">Points</SelectItem>
						<SelectItem value="9-categories">
							9-categories
						</SelectItem>
					</SelectContent>
				</Select>

				<div className="flex gap-2 items-center">
					<Button
						variant="outline"
						size="icon"
						onClick={decrementDate}
						aria-label="Previous day"
					>
						<MinusIcon />
					</Button>

					<input
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="text-center px-2"
						aria-label="Selected date"
					/>

					<Button
						variant="outline"
						size="icon"
						onClick={incrementDate}
						aria-label="Next day"
					>
						<PlusIcon />
					</Button>
				</div>
			</div>
		</div>
	);
}
