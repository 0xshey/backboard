import { fetchJson } from "../http";
import { RawCoreAthlete } from "./raw";

const CORE = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba";

export const espnCoreUrls = {
	athlete: (espnId: string) => `${CORE}/athletes/${espnId}`,
};

export async function fetchCoreAthlete(espnId: string) {
	const res = await fetchJson(espnCoreUrls.athlete(espnId), { timeoutMs: 30_000, retries: 3 });
	return RawCoreAthlete.parse(res.data);
}
