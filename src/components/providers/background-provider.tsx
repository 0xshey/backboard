"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import type { MeshGradientColorsConfig } from "@mesh-gradient/core";

const MeshGradient = dynamic(
	() => import("@mesh-gradient/react").then((m) => m.MeshGradient),
	{ ssr: false },
);

export default function BackgroundProvider() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const el = document.documentElement;
		const check = () => setIsDark(el.classList.contains("dark"));
		check();
		const observer = new MutationObserver(check);
		observer.observe(el, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, []);

	// Warm orange palette concentrated in amber/orange hues so the ripple
	// reads as a subtle orange glow regardless of which part of the canvas
	// the animation brings to the foreground.
	const colors = useMemo((): MeshGradientColorsConfig => {
		return isDark
			? ["#7a2800", "#3d1000", "#c04010", "#1f0800"]
			: ["#ffb870", "#ffd4a8", "#ff8c40", "#ffe8c8"];
	}, [isDark]);

	return (
		<MeshGradient
			style={{
				position: "fixed",
				inset: 0,
				width: "100%",
				height: "100%",
				zIndex: 0,
				opacity: isDark ? 0.5 : 0.35,
				pointerEvents: "none",
				// Fade the canvas from fully visible at the bottom to invisible
				// at the top, creating a glow effect rather than a full-page pattern.
				maskImage: "linear-gradient(to top, black 0%, transparent 55%)",
				WebkitMaskImage:
					"linear-gradient(to top, black 0%, transparent 55%)",
			}}
			options={{
				colors,
				animationSpeed: 0.12,
				seed: 42,
				appearance: "smooth",
			}}
		/>
	);
}
