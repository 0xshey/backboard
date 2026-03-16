"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import DatePicker from "@/components/date-picker";

function getTargetDate(isoDateString?: string | null) {
	const zone = "America/Los_Angeles";
	const now = DateTime.now().setZone(zone);
	if (isoDateString) {
		const target = DateTime.fromISO(isoDateString, { zone });
		if (target.hasSame(now, "day")) return now.toJSDate();
		return target.toJSDate();
	}
	return now.toJSDate();
}

function toISODateString(date: Date) {
	return DateTime.fromJSDate(date)
		.setZone("America/Los_Angeles")
		.toISODate();
}

const ABSORPTION_OPTIONS = [
	{ value: 0, label: "0%", description: "No adjustment" },
	{ value: 0.2, label: "20%", description: "Very conservative" },
	{ value: 0.4, label: "40%", description: "Conservative" },
	{ value: 0.6, label: "60%", description: "Moderate" },
	{ value: 0.8, label: "80%", description: "Aggressive" },
	{ value: 1.0, label: "100%", description: "Full redistribution" },
];

interface Props {
	absorptionRate: number;
}

export function ProjectedFPV2Controls({ absorptionRate }: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [date, setDate] = useState<Date>(() =>
		getTargetDate(searchParams.get("date")),
	);

	useEffect(() => {
		const urlDate = getTargetDate(searchParams.get("date"));
		if (toISODateString(urlDate) !== toISODateString(date)) {
			setDate(urlDate);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	useEffect(() => {
		const dateStr = toISODateString(date);
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		if (dateStr) params.set("date", dateStr);
		router.replace(`/demo/projected-fp-v2?${params.toString()}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [date]);

	function setAbsorption(value: number) {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		params.set("absorption", String(value));
		router.replace(`/demo/projected-fp-v2?${params.toString()}`);
	}

	return (
		<div className="flex flex-col gap-4">
			<DatePicker date={date} setDate={setDate} />

			<div className="flex flex-col gap-2">
				<div className="flex items-baseline gap-2">
					<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Absorption Rate
					</span>
					<span className="text-xs text-muted-foreground">
						— how much of absent players&apos; usage is absorbed by active teammates
					</span>
				</div>
				<div className="flex gap-2 flex-wrap">
					{ABSORPTION_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							onClick={() => setAbsorption(opt.value)}
							className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
								Math.abs(absorptionRate - opt.value) < 0.01
									? "bg-foreground text-background border-foreground"
									: "bg-muted/30 text-muted-foreground border-border hover:bg-muted/60"
							}`}
						>
							{opt.label}
							<span className="ml-1.5 text-xs opacity-60 font-normal">
								{opt.description}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
