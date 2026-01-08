import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Duration } from "luxon";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Data formatting
export function formatSecondsToMMSS(seconds: number): string {
	const totalSeconds = Math.floor(seconds); // ignore fractional seconds
	const minutes = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function formatISODurationToMMSS(duration: string): string {
	const durationObj = Duration.fromISO(duration);
	if (!durationObj.isValid) {
		return "0:00"; // Handle invalid duration string
	}
	return formatSecondsToMMSS(durationObj.as("seconds"));
}

export function formatISODurationToProgress(
	duration: Duration,
	maxDuration: Duration = Duration.fromObject({ minutes: 12 })
) {
	return duration.as("seconds") / maxDuration.as("seconds");
}

// Color utils moved to ./value-to-color.ts

export function smoothScrollTo(element: HTMLElement): void {
	const headerOffset = 80;
	const elementPosition = element.getBoundingClientRect().top;
	const offsetPosition = elementPosition + window.scrollY - headerOffset;

	window.scrollTo({
		top: offsetPosition,
		behavior: "smooth",
	});
}
