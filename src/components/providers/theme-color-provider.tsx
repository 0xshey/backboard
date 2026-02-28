"use client";

import { useEffect } from "react";

const LIGHT = "#ffffff";
const DARK = "#09090b";

/**
 * Keeps the <meta name="theme-color"> in sync with the current theme class.
 * This controls Safari's status bar / address bar chrome on iOS.
 */
export default function ThemeColorProvider() {
	useEffect(() => {
		let meta = document.querySelector<HTMLMetaElement>(
			'meta[name="theme-color"]',
		);
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "theme-color";
			document.head.appendChild(meta);
		}

		const update = () => {
			meta!.content = document.documentElement.classList.contains("dark")
				? DARK
				: LIGHT;
		};

		update();

		const observer = new MutationObserver(update);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	return null;
}
