"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { BackboardLogo3D } from "./backboard-logo-3d";

export function HeroScene() {
	const [scrollProgress, setScrollProgress] = useState(0);
	const [scale, setScale] = useState(1);
	const [cameraZ, setCameraZ] = useState(12);

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

			// Compensate for aspect ratio changes
			// When height is small (tall aspect), move camera closer to maintain visual size
			const aspectRatio = window.innerWidth / window.innerHeight;
			const baseAspect = 16 / 9;
			// When portrait (aspectRatio < 1), move camera closer
			const zAdjust = Math.min(aspectRatio / baseAspect, 1);
			setCameraZ(12 * Math.max(zAdjust, 0.5));
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
				camera={{ position: [0, 0, cameraZ], fov: 60 }}
				shadows
				className="w-full h-full"
			>
				<ambientLight intensity={0.1} />

				{/* Purple Light - Top Right (In front for surface reflection) */}
				<pointLight
					position={[8, 4, 9]}
					intensity={80000}
					color="#7600fd"
					distance={25}
					decay={2}
				/>

				{/* Orange Light - Bottom Left (In front for surface reflection) */}
				<pointLight
					position={[-3, -4, 5]}
					intensity={60000}
					color="#ffae00"
					distance={25}
					decay={2}
				/>

				{/* Center soft fill light */}
				<spotLight
					position={[0, 0, 15]}
					intensity={200}
					angle={0.5}
					penumbra={1}
					color="#ffffff"
				/>

				<BackboardLogo3D
					scrollProgress={scrollProgress}
					scale={scale * 0.75}
				/>
			</Canvas>
		</div>
	);
}
