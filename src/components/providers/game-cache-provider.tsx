"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GameLog } from "@/types";
import { createClient } from "@/lib/supabase/client";

type GameCache = Record<string, GameLog[]>;

interface GameCacheContextType {
	getGameLogs: (playerId: string) => Promise<GameLog[]>;
	clearCache: () => void;
	cacheSize: number;
}

const GameCacheContext = createContext<GameCacheContextType | null>(null);

export function GameCacheProvider({ children }: { children: React.ReactNode }) {
	const [cache, setCache] = useState<GameCache>({});
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = sessionStorage.getItem("game_cache");
		if (stored) {
			try {
				setCache(JSON.parse(stored));
			} catch (e) {
				console.error("Failed to parse game cache", e);
			}
		}
		setMounted(true);
	}, []);

	const saveCache = (newCache: GameCache) => {
		setCache(newCache);
		sessionStorage.setItem("game_cache", JSON.stringify(newCache));
	};

	const getGameLogs = async (playerId: string): Promise<GameLog[]> => {
		if (cache[playerId]) {
			return cache[playerId];
		}

		const supabase = createClient();
		const { data, error } = await supabase
			.from("game_player")
			.select(
				"*, game!inner(*), opp_team:game_player_team_opp_id_fkey(*)"
			)
			.eq("player_id", playerId)
			.limit(50);

		if (error) throw error;

		console.log("Supabase Data for " + playerId, data);

		// Sort by date descending
		const sortedLogs = (data as unknown as GameLog[]).sort(
			(a, b) =>
				(b.game.datetime ? new Date(b.game.datetime).getTime() : 0) -
				(a.game.datetime ? new Date(a.game.datetime).getTime() : 0)
		);

		const newCache = { ...cache, [playerId]: sortedLogs };
		saveCache(newCache);
		return sortedLogs;
	};

	const clearCache = () => {
		setCache({});
		sessionStorage.removeItem("game_cache");
	};

	return (
		<GameCacheContext.Provider
			value={{
				getGameLogs,
				clearCache,
				cacheSize: Object.keys(cache).length,
			}}
		>
			{children}
		</GameCacheContext.Provider>
	);
}

export function useGameCache() {
	const context = useContext(GameCacheContext);
	if (!context) {
		throw new Error("useGameCache must be used within a GameCacheProvider");
	}
	return context;
}
