"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { setTheme } = useTheme();

	function toggleTheme() {
		setTheme((oldTheme) => {
			if (oldTheme === "light") return "dark";
			if (oldTheme === "dark") return "light";
			return "system";
		});
	}

	return (
		<Button variant="ghost" size="icon" onClick={toggleTheme}>
			<Sun className="h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
