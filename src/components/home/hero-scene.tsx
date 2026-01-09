"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { BackboardLogo3D } from "./backboard-logo-3d";

export function HeroScene() {
	const [scrollProgress, setScrollProgress] = useState(0);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const handleScroll = () => {
			const scrollY = window.scrollY;
			const viewportHeight = window.innerHeight;
			const progress = Math.min(scrollY / viewportHeight, 1);
			setScrollProgress(progress);
		};

		const handleResize = () => {
			// Base width the backboard was designed for
			const baseWidth = 1200;
			const currentWidth = window.innerWidth;
			// Scale proportionally, with min/max bounds
			const newScale = Math.min(
				Math.max(currentWidth / baseWidth, 0.5),
				1.2
			);
			setScale(newScale);
		};

		// Initial call
		handleResize();

		window.addEventListener("scroll", handleScroll, { passive: true });
		window.addEventListener("resize", handleResize, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
			<Canvas
				camera={{ position: [0, 0, 12], fov: 60 }}
				shadows
				className="w-full h-full"
			>
				<ambientLight intensity={0.4} />

				<spotLight
					position={[0, -8, 10]}
					angle={0.6}
					penumbra={1}
					intensity={1.5}
					color="#ffffff"
					castShadow
				/>

				<pointLight
					position={[0, -6, 5]}
					intensity={2.5}
					color="#ea580c"
					distance={20}
				/>

				<directionalLight
					position={[0, 10, -5]}
					intensity={0.2}
					color="#404040"
				/>

				<BackboardLogo3D
					scrollProgress={scrollProgress}
					scale={scale}
				/>
			</Canvas>
		</div>
	);
}
