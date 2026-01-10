"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";

interface BackboardLogo3DProps {
	width?: number;
	height?: number;
	thickness?: number;
	cornerRadius?: number;
	scrollProgress?: number; // 0-1, passed from parent
	scale?: number; // Responsive scale factor
	// Animation start/end props
	startAngle?: number; // Starting rotation angle (0 = flat/face-on)
	endAngle?: number; // Ending rotation angle (looking from below)
	startZ?: number; // Starting Z position (negative = distant)
	endZ?: number; // Ending Z position
	startY?: number; // Starting Y position
	endY?: number; // Ending Y position
	animationDuration?: number;
}

export function BackboardLogo3D({
	width = 9,
	height = 5.25,
	thickness = 0.05,
	cornerRadius = 0.3,
	scrollProgress = 0,
	scale = 1,
	// Animation defaults: start flat/distant, end tilted/close
	startAngle = Math.PI / -20, // Flat (viewing direct front)
	endAngle = Math.PI / -7, // ~30 degrees (viewing from below)
	startZ = -30, // Distant
	endZ = -2, // Close
	startY = 10, // Centered
	endY = 2.4, // Slightly higher
	animationDuration = 4,
}: BackboardLogo3DProps) {
	const groupRef = useRef<THREE.Group>(null!);
	const meshRef = useRef<THREE.Mesh>(null!);

	// Animation state
	const [hasEntered, setHasEntered] = useState(false);
	const animProgress = useMotionValue(0); // 0 = start, 1 = end

	// Entrance animation
	useEffect(() => {
		const progressControl = animate(animProgress, 1, {
			duration: animationDuration,
			ease: [0.33, 1, 0.5, 1], // cubic-bezier with smooth deceleration
			onComplete: () => setHasEntered(true),
		});

		return () => {
			progressControl.stop();
		};
	}, [animationDuration]);

	// Apply animations and scroll-based tilt via useFrame
	useFrame(() => {
		if (!groupRef.current || !meshRef.current) return;

		const progress = animProgress.get();

		// Interpolate all values based on progress
		let currentAngle = startAngle + (endAngle - startAngle) * progress;
		const currentZ = startZ + (endZ - startZ) * progress;
		const currentY = startY + (endY - startY) * progress;

		// Add scroll tilt on top of current angle (smooth transition)
		if (hasEntered && scrollProgress > 0) {
			const scrollTilt = scrollProgress * (Math.PI / 6); // Max 30 degrees
			currentAngle = endAngle - scrollTilt;
		}

		meshRef.current.rotation.x = currentAngle;
		groupRef.current.position.z = currentZ;
		groupRef.current.position.y = currentY;
	});

	// Rounded rectangle shape
	const shape = useMemo(() => {
		const w = width * scale;
		const h = height * scale;
		const r = cornerRadius * scale;

		const s = new THREE.Shape();
		s.moveTo(-w / 2 + r, -h / 2);
		s.lineTo(w / 2 - r, -h / 2);
		s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
		s.lineTo(w / 2, h / 2 - r);
		s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
		s.lineTo(-w / 2 + r, h / 2);
		s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
		s.lineTo(-w / 2, -h / 2 + r);
		s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

		return s;
	}, [width, height, cornerRadius, scale]);

	const extrudeSettings = useMemo(
		() => ({
			depth: thickness,
			bevelEnabled: true,
			bevelThickness: 0.005,
			bevelSize: 0.02,
			bevelSegments: 4,
		}),
		[thickness]
	);

	return (
		<>
			{/* Animated group containing only the mesh */}
			<group ref={groupRef}>
				<Center>
					<mesh ref={meshRef} castShadow receiveShadow>
						<extrudeGeometry args={[shape, extrudeSettings]} />
						<meshPhysicalMaterial
							color="#292929" // Dark base for rim light contrast
							transmission={0.9}
							thickness={3.0} // Thicker glass for better light depth
							roughness={0.15} // Softer reflections to catch color gradients
							metalness={0.0}
							ior={1.5}
							clearcoat={1.0}
							clearcoatRoughness={0.1}
							attenuationColor="#ffffff"
							attenuationDistance={1}
							transparent
						/>
					</mesh>
				</Center>
			</group>
		</>
	);
}
