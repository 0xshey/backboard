/**
 * Data source management CLI. Run with `npx tsx scripts/sources.ts <command>`.
 *
 *   probe [source|all]             Hit every endpoint twice, validate against its raw
 *                                  schema, and write src/data/_probe-report.json.
 *   inspect <source> <dataset>     Fetch one probe endpoint and print its shape plus
 *                                  any schema issues (for debugging drift).
 *   fetch espn schedule [--season 2027] [--weeks]
 *                                  Write src/data/schedule-<season>.json; with --weeks
 *                                  also regenerate fantasy-weeks-<season>.json (Yahoo
 *                                  rules, see src/lib/sources/fantasy-weeks.ts).
 *   fetch espn players [--season 2027] [--draft]
 *                                  Write src/data/players-<season>.json from rosters +
 *                                  last season's averages; --draft enriches rookies
 *                                  via espn-core.
 *   fetch espn injuries            Write src/data/injuries.json.
 *   fetch nba-cdn schedule         Same as espn schedule, from cdn.nba.com.
 *   verify schedule [--season 2027]
 *                                  Cross-check src/data/schedule-<season>.json against
 *                                  the other source (ESPN if the file came from
 *                                  nba-cdn, and vice versa). Exits 1 on any mismatch.
 *
 * `fetch` refuses to run for a source whose last probe failed, unless --force.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { DateTime } from "luxon";
import { CURRENT_ESPN_SEASON, SOURCES, isSourceName, type SourceName } from "../src/lib/sources";
import { runProbe, type SourceProbeReport } from "../src/lib/sources/probe";
import { fetchJson } from "../src/lib/sources/http";
import * as espn from "../src/lib/sources/espn/client";
import {
	espnSeasonLabel,
	normalizeInjuries,
	normalizeRoster,
	normalizeStatsByAthlete,
	normalizeTeamSchedule,
	espnAbbrToNbaTeamId,
} from "../src/lib/sources/espn/normalize";
import { fetchCoreAthlete } from "../src/lib/sources/espn-core/client";
import { mergeCoreAthlete } from "../src/lib/sources/espn-core/normalize";
import { fetchSchedule as fetchCdnSchedule } from "../src/lib/sources/nba-cdn/client";
import { normalizeSchedule as normalizeCdnSchedule } from "../src/lib/sources/nba-cdn/normalize";
import type { PlayerBio, PlayerSeasonStats, ScheduledGame } from "../src/lib/sources/types";
import { buildYahooWeeks } from "../src/lib/sources/fantasy-weeks";
import { compareSchedules, schedulesAgree } from "../src/lib/sources/verify";
import teams from "../src/data/teams.json";

const DATA_DIR = resolve(import.meta.dirname, "../src/data");
const REPORT_PATH = resolve(DATA_DIR, "_probe-report.json");

type ProbeReportFile = Partial<Record<SourceName, SourceProbeReport & { passes: number }>>;

function flag(name: string) {
	return process.argv.includes(`--${name}`);
}

function option(name: string) {
	const i = process.argv.indexOf(`--${name}`);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

function writeJson(file: string, data: unknown) {
	const path = resolve(DATA_DIR, file);
	writeFileSync(path, JSON.stringify(data, null, "\t") + "\n");
	console.log(`wrote ${path}`);
}

function readReport(): ProbeReportFile {
	return existsSync(REPORT_PATH) ? JSON.parse(readFileSync(REPORT_PATH, "utf8")) : {};
}

// ---------------------------------------------------------------- probe

async function probe(target: string) {
	const names: SourceName[] =
		target === "all" ? (Object.keys(SOURCES) as SourceName[]) : isSourceName(target) ? [target] : [];
	if (!names.length) throw new Error(`Unknown source "${target}". Try: all, ${Object.keys(SOURCES).join(", ")}`);

	const report = readReport();
	let allOk = true;
	for (const name of names) {
		console.log(`\n▸ ${name}`);
		// The gate requires two consecutive clean passes.
		const runs = [await runProbe(name, SOURCES[name]()), await runProbe(name, SOURCES[name]())];
		const last = runs[1];
		const passes = runs.filter((r) => r.ok).length;
		for (const [i, r] of last.results.entries()) {
			const first = runs[0].results[i];
			const mark = r.ok && first.ok ? "✓" : r.ok || first.ok ? "~" : "✗";
			const detail = r.ok
				? `${r.status} ${r.ms}ms ${((r.bytes ?? 0) / 1024).toFixed(0)}KB`
				: (r.error ?? "failed");
			console.log(`  ${mark} ${r.name.padEnd(13)} ${detail}`);
			for (const issue of r.issues) console.log(`      ${issue}`);
		}
		const ok = runs.every((r) => r.ok);
		console.log(`  ${ok ? "PASS" : "FAIL"} (${passes}/2 runs clean)`);
		report[name] = { ...last, ok, passes };
		allOk &&= ok;
	}
	writeJson("_probe-report.json", report);
	return allOk;
}

function assertProbed(source: SourceName) {
	if (flag("force")) return;
	const r = readReport()[source];
	if (!r?.ok) {
		throw new Error(
			`Source "${source}" has no passing probe on record. Run \`npx tsx scripts/sources.ts probe ${source}\` first (or pass --force).`,
		);
	}
}

// ---------------------------------------------------------------- inspect

function describe(value: unknown, depth = 0): string {
	const pad = "  ".repeat(depth);
	if (Array.isArray(value)) {
		return value.length ? `[${value.length}×]\n${pad}  ${describe(value[0], depth + 1)}` : "[]";
	}
	if (value && typeof value === "object") {
		if (depth > 3) return "{…}";
		return (
			"{\n" +
			Object.entries(value)
				.map(([k, v]) => `${pad}  ${k}: ${describe(v, depth + 1)}`)
				.join("\n") +
			`\n${pad}}`
		);
	}
	return JSON.stringify(value)?.slice(0, 60) ?? "undefined";
}

async function inspect(source: string, dataset: string) {
	if (!isSourceName(source)) throw new Error(`Unknown source "${source}"`);
	const c = SOURCES[source]().find((p) => p.name === dataset);
	if (!c) throw new Error(`Unknown dataset "${dataset}" for ${source}`);
	const res = await fetchJson(c.url, { headers: c.headers, timeoutMs: c.timeoutMs });
	console.log(`${c.url}\n${res.status} ${res.ms}ms ${res.bytes}B\n`);
	console.log(describe(res.data));
	const parsed = c.schema.safeParse(res.data);
	console.log(parsed.success ? "\nschema: OK" : `\nschema issues:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
}

// ---------------------------------------------------------------- fetch

function reportSchedule(games: ScheduledGame[]) {
	const perTeam = new Map<string, number>();
	for (const g of games) {
		perTeam.set(g.homeTeamId, (perTeam.get(g.homeTeamId) ?? 0) + 1);
		perTeam.set(g.awayTeamId, (perTeam.get(g.awayTeamId) ?? 0) + 1);
	}
	const counts = [...perTeam.values()];
	console.log(
		`${games.length} games, ${perTeam.size} teams, ${Math.min(...counts)}–${Math.max(...counts)} games per team` +
			(Math.min(...counts) < 82 ? " (NBA Cup knockout games are added to schedules in December)" : ""),
	);
}

function writeSchedule(source: string, season: number, games: ScheduledGame[]) {
	games.sort((a, b) => a.datetime.localeCompare(b.datetime));
	reportSchedule(games);
	const label = espnSeasonLabel(season);
	writeJson(`schedule-${label}.json`, { source, fetchedAt: new Date().toISOString(), season: label, games });
	const weeksFile = `fantasy-weeks-${label}.json`;
	if (flag("weeks") || !existsSync(resolve(DATA_DIR, weeksFile))) {
		writeJson(weeksFile, buildYahooWeeks(games));
	} else {
		console.log(`kept hand-edited ${weeksFile} (pass --weeks to regenerate)`);
	}
}

async function collectEspnSchedule(season: number) {
	const byId = new Map<string, ScheduledGame>();
	const { sports } = await espn.fetchTeams();
	for (const { team } of sports[0].leagues[0].teams) {
		for (const g of normalizeTeamSchedule(await espn.fetchTeamSchedule(team.id, season))) byId.set(g.id, g);
		process.stdout.write(".");
	}
	process.stdout.write("\n");
	return [...byId.values()];
}

async function fetchEspnSchedule(season: number) {
	writeSchedule("espn", season, await collectEspnSchedule(season));
}

export type PlayerRecord = PlayerBio & {
	isRookie: boolean;
	stats: PlayerSeasonStats | null;
};

async function fetchEspnPlayers(season: number) {
	const { sports } = await espn.fetchTeams();
	const bios: PlayerBio[] = [];
	for (const { team } of sports[0].leagues[0].teams) {
		bios.push(...normalizeRoster(await espn.fetchRoster(team.id)));
		process.stdout.write(".");
	}
	process.stdout.write("\n");

	// Current season first; fall back to last season before opening night.
	let stats = normalizeStatsByAthlete(await espn.fetchStatsByAthlete(season), season).filter((s) => s.gp > 0);
	let statsSeason = season;
	if (stats.length === 0) {
		statsSeason = season - 1;
		stats = normalizeStatsByAthlete(await espn.fetchStatsByAthlete(statsSeason), statsSeason);
	}
	const statsById = new Map(stats.map((s) => [s.playerId, s]));

	let players: PlayerRecord[] = bios.map((b) => ({
		...b,
		isRookie: b.experience === 0,
		stats: statsById.get(b.id) ?? null,
	}));

	if (flag("draft")) {
		const rookies = players.filter((p) => p.isRookie && p.espnId);
		console.log(`enriching ${rookies.length} rookies with draft data from espn-core…`);
		const enriched = new Map<string, PlayerBio>();
		for (const p of rookies) {
			try {
				enriched.set(p.id, mergeCoreAthlete(p, await fetchCoreAthlete(p.espnId!)));
			} catch (err) {
				console.warn(`  skip ${p.name}: ${(err as Error).message}`);
			}
		}
		players = players.map((p) => ({ ...p, ...enriched.get(p.id) }));
	}

	await attachNbaIds(players);

	console.log(
		`${players.length} players (${players.filter((p) => p.isRookie).length} rookies), ` +
			`${players.filter((p) => p.stats).length} with ${espnSeasonLabel(statsSeason)} stats, ` +
			`${players.filter((p) => p.nbaId).length} matched to NBA ids`,
	);
	writeJson(`players-${espnSeasonLabel(season)}.json`, {
		source: "espn",
		fetchedAt: new Date().toISOString(),
		season: espnSeasonLabel(season),
		statsSeason: espnSeasonLabel(statsSeason),
		players,
	});
}

/**
 * Best-effort ESPN → NBA.com id match by normalized name against the existing
 * Supabase `player` table (read-only, anon key from .env.local). Unmatched
 * players (mostly new rookies) keep their ESPN headshot.
 */
async function attachNbaIds(players: PlayerRecord[]) {
	const envPath = resolve(import.meta.dirname, "../.env.local");
	if (!existsSync(envPath)) return console.log("no .env.local — skipping NBA id matching");
	const env = Object.fromEntries(
		readFileSync(envPath, "utf8")
			.split("\n")
			.map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?/))
			.filter((m): m is RegExpMatchArray => !!m)
			.map((m) => [m[1], m[2]]),
	);
	const url = env.NEXT_PUBLIC_SUPABASE_URL;
	const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
	if (!url || !key) return;

	const norm = (s: string) =>
		s
			.normalize("NFD")
			.replace(/[̀-ͯ]/g, "")
			.toLowerCase()
			.replace(/\b(jr|sr|ii|iii|iv)\b/g, "")
			.replace(/[^a-z]/g, "");
	const byName = new Map<string, string>();
	for (let from = 0; ; from += 1000) {
		const res = await fetchJson(`${url}/rest/v1/player?select=id,first_name,last_name`, {
			headers: { apikey: key, Authorization: `Bearer ${key}`, Range: `${from}-${from + 999}` },
		});
		const rows = res.data as { id: number; first_name: string; last_name: string }[];
		for (const r of rows) byName.set(norm(`${r.first_name}${r.last_name}`), String(r.id));
		if (rows.length < 1000) break;
	}
	for (const p of players) p.nbaId = byName.get(norm(p.name)) ?? null;
}

async function fetchEspnInjuries() {
	const { sports } = await espn.fetchTeams();
	const teamIdByEspnId = new Map(
		sports[0].leagues[0].teams.map(({ team }) => [team.id, espnAbbrToNbaTeamId(team.abbreviation)]),
	);
	const injuries = normalizeInjuries(await espn.fetchInjuries(), teamIdByEspnId);
	console.log(`${injuries.length} injuries`);
	writeJson("injuries.json", { source: "espn", fetchedAt: new Date().toISOString(), injuries });
}

async function collectNbaCdnSchedule() {
	return normalizeCdnSchedule(await fetchCdnSchedule());
}

async function fetchNbaCdnSchedule() {
	const games = await collectNbaCdnSchedule();
	const known = new Set(teams.map((t) => t.id));
	const unknown = games.filter((g) => !known.has(g.homeTeamId) || !known.has(g.awayTeamId));
	if (unknown.length) console.warn(`${unknown.length} games reference unknown team ids`);
	writeSchedule("nba-cdn", CURRENT_ESPN_SEASON, games);
}

// ---------------------------------------------------------------- verify

async function verifySchedule(season: number) {
	const label = espnSeasonLabel(season);
	const path = resolve(DATA_DIR, `schedule-${label}.json`);
	if (!existsSync(path)) throw new Error(`No ${path}; fetch a schedule first.`);
	const saved: { source: string; fetchedAt: string; games: ScheduledGame[] } = JSON.parse(readFileSync(path, "utf8"));

	const reference: SourceName = saved.source === "nba-cdn" ? "espn" : "nba-cdn";
	console.log(`checking ${saved.source} schedule (${saved.fetchedAt}) against live ${reference}…`);
	const live = reference === "espn" ? await collectEspnSchedule(season) : await collectNbaCdnSchedule();
	const diff = compareSchedules(saved.games, live);

	const fmt = (g: ScheduledGame) => {
		const tri = (id: string) => teams.find((t) => t.id === id)?.tricode ?? id;
		return `${tri(g.awayTeamId)} @ ${tri(g.homeTeamId)} ${DateTime.fromISO(g.datetime).setZone("America/New_York").toFormat("MMM d h:mma")} ET`;
	};
	console.log(`${saved.source}: ${diff.primaryCount} games · ${reference}: ${diff.referenceCount} games · ${diff.exact} identical`);
	for (const { primary, reference: ref } of diff.timeChanged) console.log(`  ~ time differs: ${fmt(primary)}  vs  ${fmt(ref)}`);
	for (const g of diff.primaryOnly) console.log(`  - only in ${saved.source}: ${fmt(g)}`);
	for (const g of diff.referenceOnly) console.log(`  + only in ${reference}: ${fmt(g)}`);

	const ok = schedulesAgree(diff);
	console.log(ok ? "AGREE" : "DISAGREE — re-fetch, or check which source is stale");
	return ok;
}

// ---------------------------------------------------------------- main

async function main() {
	const [cmd, a, b] = process.argv.slice(2).filter((x, i, all) => !x.startsWith("--") && !all[i - 1]?.startsWith("--season"));
	const season = Number(option("season") ?? CURRENT_ESPN_SEASON);

	switch (cmd) {
		case "probe":
			process.exitCode = (await probe(a ?? "all")) ? 0 : 1;
			return;
		case "inspect":
			return inspect(a, b);
		case "verify":
			if (a !== "schedule") throw new Error(`Unknown verify target "${a}". Try: verify schedule`);
			process.exitCode = (await verifySchedule(season)) ? 0 : 1;
			return;
		case "fetch": {
			if (!isSourceName(a)) throw new Error(`Unknown source "${a}"`);
			assertProbed(a);
			const key = `${a}:${b}`;
			if (key === "espn:schedule") return fetchEspnSchedule(season);
			if (key === "espn:players") return fetchEspnPlayers(season);
			if (key === "espn:injuries") return fetchEspnInjuries();
			if (key === "nba-cdn:schedule") return fetchNbaCdnSchedule();
			throw new Error(`No fetcher for ${key}`);
		}
		default:
			console.log(readFileSync(import.meta.filename, "utf8").match(/\/\*\*([\s\S]*?)\*\//)![1].replace(/^ \* ?/gm, ""));
	}
}

main().catch((err) => {
	console.error(`\n${(err as Error).message}`);
	process.exit(1);
});
