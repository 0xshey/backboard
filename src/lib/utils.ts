import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
