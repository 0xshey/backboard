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

export function ProjectedFPControls() {
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
		router.replace(`/demo/projected-fp?${params.toString()}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [date]);

	return (
		<DatePicker date={date} setDate={setDate} />
	);
}
