"""Canonical output models: the JSON contract the app reads from DATA_DIR.

Field names are camelCase on purpose; they must match the TypeScript types in
src/lib/sources/types.ts and src/lib/data/*.ts.
"""

from __future__ import annotations

import unicodedata
from datetime import datetime, timezone
from typing import Annotated, Optional

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, field_serializer, model_validator

NonNegative = Annotated[float, Field(ge=0)]
Pct = Annotated[float, Field(ge=0, le=1)]


def clean_text(value: str) -> str:
    """Unicode NFC + collapsed whitespace."""
    return " ".join(unicodedata.normalize("NFC", value).split())


CleanStr = Annotated[str, AfterValidator(clean_text), Field(min_length=1)]


class Canonical(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


def iso_utc(dt: datetime) -> str:
    """Same format as JavaScript's Date.toISOString(): 2026-10-20T23:30:00.000Z."""
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


class ScheduledGame(Canonical):
    id: str = Field(pattern=r"^(espn|nba):\w+$")
    datetime: datetime
    homeTeamId: str = Field(pattern=r"^\d+$")
    awayTeamId: str = Field(pattern=r"^\d+$")
    timeValid: bool

    @model_validator(mode="after")
    def _distinct_teams(self) -> "ScheduledGame":
        if self.homeTeamId == self.awayTeamId:
            raise ValueError("home and away team are the same")
        if self.datetime.tzinfo is None:
            raise ValueError("datetime must be timezone-aware")
        return self

    @field_serializer("datetime")
    def _ser_dt(self, dt: datetime) -> str:
        return iso_utc(dt)


class FantasyWeek(Canonical):
    number: int = Field(ge=1)
    label: str
    start_date: str
    end_date: str
    notes: Optional[str]


class PlayerSeasonStats(Canonical):
    playerId: str
    season: str = Field(pattern=r"^\d{4}-\d{2}$")
    gp: int = Field(ge=0, le=82)
    min: NonNegative
    pts: NonNegative
    reb: NonNegative
    ast: NonNegative
    stl: NonNegative
    blk: NonNegative
    tov: NonNegative
    fgm: NonNegative
    fga: NonNegative
    fg3m: NonNegative
    fg3a: NonNegative
    ftm: NonNegative
    fta: NonNegative
    fgPct: Pct
    ftPct: Pct
    fg3Pct: Pct


class PlayerRecord(Canonical):
    id: str = Field(pattern=r"^espn:\d+$")
    espnId: Optional[str]
    nbaId: Optional[str]
    name: CleanStr
    teamId: Optional[str]
    position: Optional[str]
    dateOfBirth: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    age: Optional[int] = Field(default=None, ge=15, le=50)
    experience: Optional[int] = Field(default=None, ge=0, le=30)
    draftYear: Optional[int] = Field(default=None, ge=1970, le=2100)
    draftRound: Optional[int] = Field(default=None, ge=1, le=2)
    draftPick: Optional[int] = Field(default=None, ge=1, le=60)
    headshotUrl: Optional[str]
    isRookie: bool
    stats: Optional[PlayerSeasonStats]


class InjuryItem(Canonical):
    playerId: str
    playerName: CleanStr
    teamId: Optional[str]
    status: CleanStr
    date: str
    comment: Optional[str]
