/**
 * ESPN raw → canonical. ESPN uses its own team/player ids and a few non-standard
 * abbreviations; teams are mapped to NBA.com ids through src/data/teams.json.
 */
import teams from "../../../data/teams.json";
import type {
	InjuryItem,
	NbaTeamId,
	PlayerBio,
	PlayerSeasonStats,
	ScheduledGame,
} from "../types";
import type { RawInjuries, RawRoster, RawStatsByAthlete, RawTeamSchedule } from "./raw";

/** ESPN abbreviation → NBA tricode, where they differ. */
const ESPN_TO_TRICODE: Record<string, string> = {
	GS: "GSW",
	NY: "NYK",
	SA: "SAS",
	NO: "NOP",
	UTAH: "UTA",
	WSH: "WAS",
};

const TRICODE_TO_NBA_ID = new Map(teams.map((t) => [t.tricode, t.id]));

export function espnAbbrToTricode(abbr: string) {
	return ESPN_TO_TRICODE[abbr] ?? abbr;
}

export function espnAbbrToNbaTeamId(abbr: string): NbaTeamId {
	const id = TRICODE_TO_NBA_ID.get(espnAbbrToTricode(abbr));
	if (!id) throw new Error(`Unknown ESPN team abbreviation "${abbr}"`);
	return id;
}

export function espnSeasonLabel(season: number) {
	return `${season - 1}-${String(season % 100).padStart(2, "0")}`;
}

/** Regular-season games from one team's schedule. Dedupe across teams by id. */
export function normalizeTeamSchedule(raw: RawTeamSchedule): ScheduledGame[] {
	return raw.events
		.filter((e) => e.seasonType.type === 2)
		.map((e) => {
			const comps = e.competitions[0].competitors;
			const home = comps.find((c) => c.homeAway === "home")!;
			const away = comps.find((c) => c.homeAway === "away")!;
			return {
				id: `espn:${e.id}`,
				datetime: new Date(e.date).toISOString(),
				homeTeamId: espnAbbrToNbaTeamId(home.team.abbreviation),
				awayTeamId: espnAbbrToNbaTeamId(away.team.abbreviation),
				timeValid: e.timeValid ?? true,
			};
		});
}

export function normalizeRoster(raw: RawRoster): PlayerBio[] {
	const teamId = espnAbbrToNbaTeamId(raw.team.abbreviation);
	return raw.athletes.map((a) => ({
		id: `espn:${a.id}`,
		espnId: a.id,
		nbaId: null,
		name: a.displayName,
		teamId,
		position: a.position?.abbreviation ?? null,
		dateOfBirth: a.dateOfBirth ? a.dateOfBirth.slice(0, 10) : null,
		age: a.age ?? null,
		experience: a.experience?.years ?? null,
		draftYear: null,
		draftRound: null,
		draftPick: null,
		headshotUrl: a.headshot?.href ?? null,
	}));
}

/** Flatten ESPN's parallel names/values arrays into canonical per-game averages. */
export function normalizeStatsByAthlete(
	pages: RawStatsByAthlete[],
	season: number,
): PlayerSeasonStats[] {
	const out: PlayerSeasonStats[] = [];
	for (const page of pages) {
		const names = new Map(page.categories.map((c) => [c.name, c.names]));
		for (const a of page.athletes) {
			const v: Record<string, number> = {};
			for (const cat of a.categories) {
				const keys = names.get(cat.name) ?? [];
				cat.values.forEach((val, i) => {
					if (keys[i] && val != null) v[keys[i]] = val;
				});
			}
			const pct = (x: number | undefined) => (x == null ? 0 : x / 100);
			out.push({
				playerId: `espn:${a.athlete.id}`,
				season: espnSeasonLabel(season),
				gp: v.gamesPlayed ?? 0,
				min: v.avgMinutes ?? 0,
				pts: v.avgPoints ?? 0,
				reb: v.avgRebounds ?? 0,
				ast: v.avgAssists ?? 0,
				stl: v.avgSteals ?? 0,
				blk: v.avgBlocks ?? 0,
				tov: v.avgTurnovers ?? 0,
				fgm: v.avgFieldGoalsMade ?? 0,
				fga: v.avgFieldGoalsAttempted ?? 0,
				fg3m: v.avgThreePointFieldGoalsMade ?? 0,
				fg3a: v.avgThreePointFieldGoalsAttempted ?? 0,
				ftm: v.avgFreeThrowsMade ?? 0,
				fta: v.avgFreeThrowsAttempted ?? 0,
				fgPct: pct(v.fieldGoalPct),
				ftPct: pct(v.freeThrowPct),
				fg3Pct: pct(v.threePointFieldGoalPct),
			});
		}
	}
	return out;
}

export function normalizeInjuries(raw: RawInjuries, teamIdByEspnId: Map<string, NbaTeamId>): InjuryItem[] {
	return raw.injuries.flatMap((team) =>
		team.injuries.map((i) => {
			const href = i.athlete.links?.[0]?.href ?? "";
			const espnId = href.match(/\/id\/(\d+)/)?.[1];
			return {
				playerId: espnId ? `espn:${espnId}` : `espn-name:${i.athlete.displayName}`,
				playerName: i.athlete.displayName,
				teamId: teamIdByEspnId.get(team.id) ?? null,
				status: i.status,
				date: i.date,
				comment: i.shortComment ?? null,
			};
		}),
	);
}
