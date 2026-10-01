import { DateTime } from "luxon";

/** "Sep 30, 2026" in US Eastern time. */
export function formatUpdated(iso: string) {
	return DateTime.fromISO(iso).setZone("America/New_York").toFormat("MMM d, yyyy");
}
