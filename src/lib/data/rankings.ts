import { playerHeadshotURL } from "@/lib/image-urls";
import type { RankingsRow } from "@/components/rankings/rankings-table";
import { getTeams } from "./schedule";
import type { PlayerRecord } from "./players";


/** Prefer NBA.com headshots (consistent style); fall back to ESPN's for unmatched players. */
export function playerImageURL(p: PlayerRecord) {
	return p.nbaId ? playerHeadshotURL(p.nbaId) : p.headshotUrl;
}

function tricodeFor(teamId: string) {
	return getTeams().find((t) => t.id === teamId)?.tricode ?? null;
}

export function toRankingsRow(
	p: PlayerRecord,
	values: RankingsRow["values"],
): RankingsRow {
	return {
		id: p.id,
		name: p.name,
		imageUrl: playerImageURL(p),
		teamId: p.teamId,
		tricode: p.teamId ? tricodeFor(p.teamId) : null,
		position: p.position,
		badge: p.isRookie ? "R" : null,
		values,
	};
}
