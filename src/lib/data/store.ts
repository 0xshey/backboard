/**
 * Reads published JSON datasets at request time, so a data refresh (e.g. the
 * pipeline container on the NAS) shows up without rebuilding the app.
 *
 * Lookup order: DATA_DIR (shared volume) → SEED_DATA_DIR (bundled fallback in
 * the Docker image) → src/data (local dev). Parsed files are cached until
 * their mtime changes; the pipeline swaps files atomically, so a read never
 * sees a half-written file.
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

/** Season label used in dataset filenames, e.g. "2026-27". */
export const SEASON = process.env.DATA_SEASON ?? "2026-27";

const DIRS = [process.env.DATA_DIR, process.env.SEED_DATA_DIR, path.join(process.cwd(), "src/data")].filter(
	(d): d is string => !!d,
);

const cache = new Map<string, { mtimeMs: number; data: unknown }>();

export function readDataFile<T>(name: string): T {
	for (const dir of DIRS) {
		const file = path.join(dir, name);
		let mtimeMs: number;
		try {
			mtimeMs = statSync(file).mtimeMs;
		} catch {
			continue;
		}
		const hit = cache.get(file);
		if (hit && hit.mtimeMs === mtimeMs) return hit.data as T;
		const data = JSON.parse(readFileSync(file, "utf8")) as T;
		cache.set(file, { mtimeMs, data });
		return data;
	}
	throw new Error(`Data file "${name}" not found in ${DIRS.join(", ")}`);
}
