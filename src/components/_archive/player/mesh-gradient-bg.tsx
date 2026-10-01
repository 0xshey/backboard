"use client";

import { useState, useEffect, useMemo } from "react";
import { MeshGradient } from "@mesh-gradient/react";
import type { MeshGradientColorsConfig } from "@mesh-gradient/core";

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace("#", "").padEnd(6, "0");
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16),
	];
}

function rgbToHex(r: number, g: number, b: number): string {
	return (
		"#" +
		[r, g, b]
			.map((v) =>
				Math.round(Math.max(0, Math.min(255, v)))
					.toString(16)
					.padStart(2, "0"),
			)
			.join("")
	);
}

function mixHex(a: string, b: string, t: number): string {
	const [r1, g1, b1] = hexToRgb(a);
	const [r2, g2, b2] = hexToRgb(b);
	return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

interface MeshGradientBgProps {
	primaryColor: string;
	secondaryColor: string;
}

export function MeshGradientBg({
	primaryColor,
	secondaryColor,
}: MeshGradientBgProps) {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const el = document.documentElement;
		const check = () => setIsDark(el.classList.contains("dark"));
		check();
		const observer = new MutationObserver(check);
		observer.observe(el, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, []);

	const colors = useMemo((): MeshGradientColorsConfig => {
		// In light mode: blend team colors toward white to keep it airy.
		// In dark mode: blend team colors toward near-black to keep it deep.
		const neutral = isDark ? "#0a0a0a" : "#ffffff";
		return [
			mixHex(primaryColor, neutral, 0.5),
			neutral,
			mixHex(secondaryColor, neutral, 0.5),
			neutral,
		];
	}, [primaryColor, secondaryColor, isDark]);

	return (
		<MeshGradient
			style={{
				position: "absolute",
				inset: 0,
				width: "100%",
				height: "100%",
				opacity: 0.4,
			}}
			options={{
				colors,
				animationSpeed: 0.3,
				seed: 14,
				appearance: "smooth",
			}}
		/>
	);
}
