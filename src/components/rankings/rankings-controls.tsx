// /Users/shey/Developer/backboard/backboard/src/components/rankings/rankings-controls.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";

import DatePicker from "@/components/date-picker";
import { DateTime } from "luxon";

/**
 * Ensures the date provided is treated as a local date in the target timezone (LA).
 * We want "2024-10-25" to mean Oct 25th in LA, regardless of where the server or browser is.
 */
function getTargetDate(isoDateString?: string | null) {
    const zone = "America/Los_Angeles";
    const now = DateTime.now().setZone(zone);

    if (isoDateString) {
        // Parse strictly as ISO date into the zone
        const target = DateTime.fromISO(isoDateString, { zone });
        
        // If the target date is the same "day" as now, return now (with current time)
        // This avoids the "12:00 AM" display when looking at today's stats
        if (target.hasSame(now, 'day')) {
             return now.toJSDate();
        }
        
        // Otherwise return the target date (midnight)
        return target.toJSDate();
    }
    // Default to "now" in the target zone
    return now.toJSDate();
}

/**
 * Format a JS Date back to YYYY-MM-DD string relative to the target timezone.
 * Important: The JS Date object might be "Tue Oct 25 2024 00:00:00 GMT-0700"
 * We want to extract "2024-10-25".
 */
function toISODateString(date: Date) {
    // We treat the JS Date as the source of truth for the *moment* in time.
    // However, the user intent is usually "Day X".
    // If the DatePicker returns a Date that is "local midnight", we should format it as such.
    // Let's use Luxon to ensure we format it correctly in our target zone.
    return DateTime.fromJSDate(date).setZone("America/Los_Angeles").toISODate();
}

export function RankingsControls() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Initialize state from URL
    const [isPending, startTransition] = useTransition();
	const [date, setDate] = useState<Date>(() => getTargetDate(searchParams.get("date")));


	// Sync from URL changes (backward navigation)
	useEffect(() => {
        const urlDateStr = searchParams.get("date");
        const newDate = getTargetDate(urlDateStr);
        
        // Only update if significantly different (day level) to avoid loops if time components differ slightly
        if (toISODateString(newDate) !== toISODateString(date)) {
            setDate(newDate);
        }
        

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	// Push updates to URL
	useEffect(() => {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
        
        const dateStr = toISODateString(date);
        if (dateStr) params.set("date", dateStr);
        


		const query = params.toString();
		router.replace(query ? `/rankings?${query}` : `/rankings`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [date]);

	// Auto-refresh logic
	useEffect(() => {
		const interval = setInterval(() => {
			startTransition(() => {
                router.refresh();
            });
		}, 60 * 1000);
		return () => clearInterval(interval);
	}, [router]);

	return (
		<div className="w-full max-w-md mb-10 flex flex-col gap-4">
			<div className="flex gap-8 items-center justify-center">
				<DatePicker 
                    date={date} 
                    setDate={setDate} 
                />
                {isPending && <Spinner />}
			</div>
		</div>
	);
}
