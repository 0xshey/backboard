import type { ProbeCase } from "../probe";
import { espnCoreUrls } from "./client";
import { RawCoreAthlete } from "./raw";

export function espnCoreProbeCases(): ProbeCase[] {
	return [
		{ name: "athlete", url: espnCoreUrls.athlete("3112335"), schema: RawCoreAthlete, timeoutMs: 30_000 },
	];
}
