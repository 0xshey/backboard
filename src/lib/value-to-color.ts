export type RGBA = [number, number, number, number];

export interface ValueToRGBAOptions {
	value: number;
	min?: number;
	max?: number;
	lowColor?: RGBA;
	midColor?: RGBA;
	highColor?: RGBA;
	schema?: "default" | "fantasyPoints" | "percentages";
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
	min,
	max,
	lowColor,
	midColor,
	highColor,
	schema = "default",
}: ValueToRGBAOptions): string {
	let r: number, g: number, b: number, a: number;

	if (schema === "fantasyPoints") {
		const stops: {
			val: number;
			color: [number, number, number, number];
		}[] = [
			// --- LOWER EXTREME (Highly Visible) ---
			{ val: 0, color: [142, 1, 82, 1] }, // Deep Pink/Maroon (High contrast)
			{ val: 10, color: [197, 27, 125, 1] }, // Vibrant Magenta
			{ val: 20, color: [241, 182, 218, 1] }, // Faded Rose (Transitioning out)

			// --- NEUTRAL CENTER (The "Fade") ---
			{ val: 25, color: [247, 247, 247, 1] }, // Neutral Off-White (The Pivot)

			// --- UPPER EXTREME (Highly Visible) ---
			{ val: 35, color: [204, 251, 241, 1] }, // Very Pale Mint (Transitioning in)
			{ val: 50, color: [45, 212, 191, 1] }, // Bright Teal
			{ val: 75, color: [20, 184, 166, 1] }, // Strong Teal/Aqua
			{ val: 100, color: [6, 182, 212, 1] }, // Electric Cyan (High Pop)
		];

		// Find the segment
		let lower = stops[0];
		let upper = stops[stops.length - 1];

		for (let i = 0; i < stops.length - 1; i++) {
			if (value >= stops[i].val && value <= stops[i + 1].val) {
				lower = stops[i];
				upper = stops[i + 1];
				break;
			}
		}

		// Clamp value to the range of stops for interpolation
		const clampedValue = clamp(
			value,
			stops[0].val,
			stops[stops.length - 1].val
		);

		const range = upper.val - lower.val;
		const t = range === 0 ? 0 : (clampedValue - lower.val) / range;
		[r, g, b, a] = interpolateColor(lower.color, upper.color, t);
	} else if (schema === "percentages") {
		// Red -> Neutral -> Red
		const effectiveMin = min ?? 0; // Default to 0%
		const effectiveMax = max ?? 1; // Default to 100% (as 1.0)
		const effectiveMid = (effectiveMin + effectiveMax) / 2;

		const redColor: RGBA = [239, 68, 68, 1]; // red-500
		const neutralColor: RGBA = [156, 163, 175, 1]; // gray-400 (Neutral)

		// Clamp value within the effective min/max range
		const clampedValue = clamp(value, effectiveMin, effectiveMax);

		if (clampedValue <= effectiveMid) {
			// Red -> Neutral
			const t = clamp(
				(clampedValue - effectiveMin) / (effectiveMid - effectiveMin)
			);
			[r, g, b, a] = interpolateColor(redColor, neutralColor, t);
		} else {
			// Neutral -> Red
			const t = clamp(
				(clampedValue - effectiveMid) / (effectiveMax - effectiveMid)
			);
			[r, g, b, a] = interpolateColor(neutralColor, redColor, t);
		}
	} else {
		// Default Logic: (low -> mid -> high)
		const finalMin = min ?? 15;
		const finalMax = max ?? 60;
		const finalLow = lowColor ?? [239, 68, 68, 1]; // red-500
		const finalMid = midColor ?? [234, 179, 8, 1]; // yellow-500
		const finalHigh = highColor ?? [34, 197, 94, 1]; // green-500

		const mid = (finalMin + finalMax) / 2;

		// Clamp value within the final min/max range
		const clampedValue = clamp(value, finalMin, finalMax);

		if (clampedValue <= mid) {
			const t = clamp((clampedValue - finalMin) / (mid - finalMin));
			[r, g, b, a] = interpolateColor(finalLow, finalMid, t);
		} else {
			const t = clamp((clampedValue - mid) / (finalMax - mid));
			[r, g, b, a] = interpolateColor(finalMid, finalHigh, t);
		}
	}

	return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${
		Math.round(a * 1000) / 1000
	})`;
}

export function getContrastingColor(bgColor: string): string {
	// Basic contrast logic (YIQ)
	const match = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!match) return "#000000";

	const r = parseInt(match[1], 10);
	const g = parseInt(match[2], 10);
	const b = parseInt(match[3], 10);

	// Calculate brightness (YIQ formula)
	const yiq = (r * 299 + g * 587 + b * 114) / 1000;

	// Returns black for light backgrounds, white for dark backgrounds
	return yiq >= 128 ? "#000000" : "#ffffff";
}
