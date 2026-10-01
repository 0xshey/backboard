"""ESPN core API (sports.core.api.espn.com): draft data. This host times out
intermittently, so it's isolated and treated as optional enrichment."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from ..http import HttpClient

CORE = "https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba"


class RawDraft(BaseModel):
    model_config = ConfigDict(extra="ignore")
    year: int
    round: int
    selection: int


class RawCoreAthlete(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    displayName: str
    dateOfBirth: Optional[str] = None
    draft: Optional[RawDraft] = None


class EspnCore:
    name = "espn-core"

    def __init__(self, http: HttpClient):
        self.http = http

    def probe(self) -> None:
        self.fetch_athlete("3112335")

    def fetch_athlete(self, espn_id: str) -> RawCoreAthlete:
        return RawCoreAthlete.model_validate(self.http.get_json(f"{CORE}/athletes/{espn_id}").data)

    def enrich(self, bio: dict) -> dict:
        """Fill draft fields on a roster bio. Failures leave the bio unchanged."""
        raw = self.fetch_athlete(bio["espnId"])
        return {
            **bio,
            "dateOfBirth": bio["dateOfBirth"] or (raw.dateOfBirth[:10] if raw.dateOfBirth else None),
            "draftYear": raw.draft.year if raw.draft else None,
            "draftRound": raw.draft.round if raw.draft else None,
            "draftPick": raw.draft.selection if raw.draft else None,
        }
