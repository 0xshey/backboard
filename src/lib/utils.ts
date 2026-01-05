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

// Color utils
type RGBA = [number, number, number, number];

interface ValueToRGBAOptions {
	value: number;
	min?: number;
	max?: number;
	lowColor?: RGBA;
	midColor?: RGBA;
	highColor?: RGBA;
}

function interpolateColor(a: RGBA, b: RGBA, t: number): RGBA {
	return [
		a[0] + (b[0] - a[0]) * t, // R
		a[1] + (b[1] - a[1]) * t, // G
		a[2] + (b[2] - a[2]) * t, // B
		a[3] + (b[3] - a[3]) * t, // A
	];
}

function clamp(x: number, min = 0, max = 1): number {
	return Math.min(max, Math.max(min, x));
}

export function valueToRGB({
	value,
	min = 15,
	max = 60,
	lowColor = [192, 11, 35, 1], // red
	midColor = [0, 0, 0, 0], // transparent
	highColor = [43, 168, 74, 1], // green
}: ValueToRGBAOptions): string {
	if (max === min) {
		const [r, g, b, a] = midColor;
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	const t = (value - min) / (max - min); // Normalize 0 → 1
	const mid = 0.5;

	let rgba: RGBA;

	if (t <= mid) {
		const tLow = clamp(t / mid);
		rgba = interpolateColor(lowColor, midColor, tLow);
	} else {
		const tHigh = clamp((t - mid) / mid);
		rgba = interpolateColor(midColor, highColor, tHigh);
	}

	const [r, g, b, a] = rgba.map((v) => Math.round(v * 1000) / 1000) as RGBA;

	return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

export function smoothScrollTo(element: HTMLElement): void {
	const start: number = window.scrollY;
	const end: number = element.offsetTop;
	const duration: number = 1500; // Duration of the scroll in milliseconds

	// Easing function type
	const easing = (t: number): number => {
		return t < 0.5
			? 16 * Math.pow(t, 5) // ease in
			: 1 - Math.pow(-2 * t + 2, 5) / 2; // ease out
	};

	let startTime: number | undefined;

	function step(timestamp: number): void {
		if (!startTime) startTime = timestamp;
		const progress: number = (timestamp - startTime) / duration;
		const easedProgress: number = easing(progress);

		window.scrollTo(0, start + (end - start) * easedProgress);

		if (progress < 1) {
			requestAnimationFrame(step);
		}
	}

	requestAnimationFrame(step);
}
