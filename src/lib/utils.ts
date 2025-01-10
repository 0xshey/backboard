import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function parseDuration(iso8601Duration: string) {
	const duration = moment.duration(iso8601Duration);
	
	return `${duration.minutes()}:${duration.seconds().toString().padStart(2, '0')}`;
};


export function getStartAndEndOfDay(date: Date) {
	const startOfDay = new Date(date)
	startOfDay.setHours(0, 0, 0, 0)

	const endOfDay = new Date(date)
	endOfDay.setHours(23, 59, 59, 999)

	return {
		startTime: startOfDay.toISOString(),
		endTime: endOfDay.toISOString(),
	}
}

export function addOrdinalSuffix(num: number): string {
	const suffixes = ["th", "st", "nd", "rd"];
	const value = num % 100;
	return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
}