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