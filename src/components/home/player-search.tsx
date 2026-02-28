"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { playerHeadshotURL, teamLogoURL } from "@/lib/image-urls";
import type { PlayerSearchResult } from "@/app/api/players/search/route";
import { KbdGroup, Kbd } from "../ui/kbd";

export function PlayerSearch() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<PlayerSearchResult[]>([]);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [isMac, setIsMac] = useState(true);

	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setIsMac(navigator.userAgent.includes("Mac"));
	}, []);

	// Global ⌘K / Ctrl+K to focus search
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, []);

	const search = useCallback(async (q: string) => {
		if (q.trim().length < 2) {
			setResults([]);
			setOpen(false);
			return;
		}
		setLoading(true);
		try {
			const res = await fetch(
				`/api/players/search?q=${encodeURIComponent(q)}`,
			);
			const data: PlayerSearchResult[] = await res.json();
			setResults(data);
			setOpen(data.length > 0);
			setActiveIndex(-1);
		} finally {
			setLoading(false);
		}
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setQuery(val);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => search(val), 250);
	};

	const navigate = useCallback(
		(player: PlayerSearchResult) => {
			setOpen(false);
			setQuery("");
			setResults([]);
			router.push(`/player/${player.id}`);
		},
		[router],
	);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!open || results.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveIndex((i) => (i + 1) % results.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			const target = results[activeIndex] ?? results[0];
			if (target) navigate(target);
		} else if (e.key === "Escape") {
			setOpen(false);
			setActiveIndex(-1);
		}
	};

	// Scroll active item into view
	useEffect(() => {
		if (activeIndex < 0 || !listRef.current) return;
		const item = listRef.current.children[activeIndex] as HTMLElement;
		item?.scrollIntoView({ block: "nearest" });
	}, [activeIndex]);

	// Close on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				!inputRef.current
					?.closest("[data-player-search]")
					?.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const showKbdHint = !isFocused && !query;

	return (
		<div data-player-search className="relative w-full max-w-lg mx-auto">
			{/* Input */}
			<div className="relative flex items-center">
				<Search
					className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none"
					strokeWidth={2}
				/>
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						setIsFocused(true);
						if (results.length > 0) setOpen(true);
					}}
					onBlur={() => setIsFocused(false)}
					placeholder="Search players…"
					autoComplete="off"
					className="w-full h-12 pl-4 pr-28 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 text-[16px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-border transition-all shadow-lg"
				/>

				{/* Right side: spinner or kbd hint */}
				<div className="absolute right-3 flex items-center gap-1 pointer-events-none">
					{loading ? (
						<span className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
					) : showKbdHint ? (
						<>
							<KbdGroup>
								<Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
								<Kbd>K</Kbd>
							</KbdGroup>
						</>
					) : null}
				</div>
			</div>

			{/* Dropdown */}
			{open && results.length > 0 && (
				<ul
					ref={listRef}
					className="absolute z-50 top-full mt-2 w-full rounded-2xl bg-background/90 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden py-1"
				>
					{results.map((player, i) => {
						const isActive = i === activeIndex;
						return (
							<li key={player.id}>
								<button
									type="button"
									onMouseEnter={() => setActiveIndex(i)}
									onClick={() => navigate(player)}
									className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
									style={{
										backgroundColor: isActive
											? "hsl(var(--muted))"
											: "transparent",
									}}
								>
									{/* Headshot */}
									<Image
										src={playerHeadshotURL(
											String(player.id),
										)}
										alt={`${player.first_name} ${player.last_name}`}
										width={36}
										height={27}
										className="rounded-md object-cover bg-muted shrink-0"
										unoptimized
									/>

									{/* Name */}
									<span className="flex-1 text-sm font-medium leading-tight">
										{player.first_name}{" "}
										<span className="font-semibold">
											{player.last_name}
										</span>
									</span>

									{/* Team logo + jersey number */}
									<div className="flex items-center gap-1.5 shrink-0">
										{player.team && (
											<Image
												src={teamLogoURL(
													String(player.team.id),
												)}
												alt="team logo"
												width={20}
												height={20}
												className="object-contain"
												unoptimized
											/>
										)}
										{player.jersey_number != null && (
											<span className="text-xs text-muted-foreground tabular-nums w-5 text-right">
												#{player.jersey_number}
											</span>
										)}
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
