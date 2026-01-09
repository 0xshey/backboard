"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { BackboardLogo3D } from "./backboard-logo-3d";

export function HeroScene() {
	const [scrollProgress, setScrollProgress] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			// Calculate scroll progress (0-1) based on first viewport height
			const scrollY = window.scrollY;
			const viewportHeight = window.innerHeight;
			const progress = Math.min(scrollY / viewportHeight, 1);
			setScrollProgress(progress);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none">
			<Canvas
				camera={{ position: [0, 0, 12], fov: 50 }}
				shadows
				className="w-full h-full"
			>
				{/* Ambient for base visibility */}
				<ambientLight intensity={0.4} />

				{/* Main light from front-bottom for glow effect */}
				<spotLight
					position={[0, -8, 10]}
					angle={0.6}
					penumbra={1}
					intensity={1.5}
					color="#ffffff"
					castShadow
				/>

				{/* Orange glow from bottom */}
				<pointLight
					position={[0, -6, 5]}
					intensity={2.5}
					color="#ea580c"
					distance={20}
				/>

				{/* Dim light from top for shadow on back of board */}
				<directionalLight
					position={[0, 10, -5]}
					intensity={0.2}
					color="#404040"
				/>

				<BackboardLogo3D scrollProgress={scrollProgress} />
			</Canvas>
		</div>
	);
}
