"""NBA.com CDN (cdn.nba.com). Official schedule with NBA ids, but Akamai blocks
many non-browser clients (Python's requests included, from some networks), so
the pipeline only uses it as an optional cross-check for the ESPN schedule."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from ..http import HttpClient
from ..models import ScheduledGame

SCHEDULE_URL = "https://cdn.nba.com/static/json/staticData/scheduleLeagueV2.json"
HEADERS = {"Origin": "https://www.nba.com", "Referer": "https://www.nba.com/"}


class Raw(BaseModel):
    model_config = ConfigDict(extra="ignore")


class RawCdnTeam(Raw):
    teamId: int
    teamTricode: Optional[str] = None  # null for undecided NBA Cup knockout games


class RawCdnGame(Raw):
    gameId: str
    gameDateTimeUTC: str
    homeTeam: RawCdnTeam
    awayTeam: RawCdnTeam


class RawGameDate(Raw):
    games: list[RawCdnGame]


class RawLeagueSchedule(Raw):
    seasonYear: str
    gameDates: list[RawGameDate]


class RawSchedule(Raw):
    leagueSchedule: RawLeagueSchedule


class NbaCdn:
    name = "nba-cdn"

    def __init__(self, http: HttpClient):
        self.http = http

    def probe(self) -> None:
        self.fetch_schedule()

    def fetch_schedule(self) -> RawSchedule:
        return RawSchedule.model_validate(
            self.http.get_json(SCHEDULE_URL, headers=HEADERS, archive_as="nba-cdn-schedule").data
        )

    def schedule(self, raw: RawSchedule | None = None) -> list[ScheduledGame]:
        """Regular season only (game ids 002…), skipping placeholder games (teamId 0)."""
        raw = raw or self.fetch_schedule()
        games = [
            ScheduledGame(
                id=f"nba:{g.gameId}",
                datetime=datetime.fromisoformat(g.gameDateTimeUTC.replace("Z", "+00:00")),
                homeTeamId=str(g.homeTeam.teamId),
                awayTeamId=str(g.awayTeam.teamId),
                timeValid=True,
            )
            for d in raw.leagueSchedule.gameDates
            for g in d.games
            if g.gameId.startswith("002") and g.homeTeam.teamId and g.awayTeam.teamId
        ]
        return sorted(games, key=lambda g: (g.datetime, g.id))
