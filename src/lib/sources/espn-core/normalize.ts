import type { PlayerBio } from "../types";
import type { RawCoreAthlete } from "./raw";

/** Fill draft/bio fields on an existing bio (from the ESPN roster tool). */
export function mergeCoreAthlete(bio: PlayerBio, raw: RawCoreAthlete): PlayerBio {
	return {
		...bio,
		dateOfBirth: bio.dateOfBirth ?? raw.dateOfBirth?.slice(0, 10) ?? null,
		age: bio.age ?? raw.age ?? null,
		experience: bio.experience ?? raw.experience?.years ?? null,
		draftYear: raw.draft?.year ?? null,
		draftRound: raw.draft?.round ?? null,
		draftPick: raw.draft?.selection ?? null,
	};
}
