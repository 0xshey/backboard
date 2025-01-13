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

export function valueToRGB(
	value: number,
	lowColor: { red: number; green: number; blue: number } = { red: 255, green: 0, blue: 0 },
	highColor: { red: number; green: number; blue: number } = { red: 0, green: 255, blue: 0 },
	midColor: { red: number; green: number; blue: number } = { red: 255, green: 255, blue: 255 }
): string {
	const getColor = (color1: { red: number; green: number; blue: number }, color2: { red: number; green: number; blue: number }, fade: number) => ({
		red: Math.floor(color1.red + (color2.red - color1.red) * fade),
		green: Math.floor(color1.green + (color2.green - color1.green) * fade),
		blue: Math.floor(color1.blue + (color2.blue - color1.blue) * fade),
	});

	let color1 = lowColor;
	let color2 = highColor;
	let fade = value;

	if (midColor) {
		fade *= 2;
		if (fade >= 1) {
			fade -= 1;
			color1 = midColor;
			color2 = highColor;
		} else {
			color2 = midColor;
		}
	}

	const gradient = getColor(color1, color2, fade);
	return `rgb(${gradient.red},${gradient.green},${gradient.blue})`;
}
