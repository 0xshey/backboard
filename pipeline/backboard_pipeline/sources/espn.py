"""ESPN (site.web.api.espn.com). Free, no key, undocumented: schemas are
validated on every fetch so upstream changes fail loudly. The sibling host
site.api.espn.com is edge-blocked; don't switch to it."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from ..http import HttpClient
from ..models import InjuryItem, PlayerRecord, PlayerSeasonStats, ScheduledGame
from .teams import TeamIndex

SITE = "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba"
COMMON = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba"
REGULAR_SEASON = 2

# ESPN abbreviation → NBA tricode where they differ.
ESPN_TO_TRICODE = {"GS": "GSW", "NY": "NYK", "SA": "SAS", "NO": "NOP", "UTAH": "UTA", "WSH": "WAS"}


class Raw(BaseModel):
    model_config = ConfigDict(extra="ignore")


# ---------------------------------------------------------------- raw schemas


class RawTeamRef(Raw):
    id: str
    abbreviation: str


class RawTeamEntry(Raw):
    team: RawTeamRef


class RawLeague(Raw):
    teams: list[RawTeamEntry] = Field(min_length=30, max_length=30)


class RawSport(Raw):
    leagues: list[RawLeague] = Field(min_length=1)


class RawTeams(Raw):
    sports: list[RawSport] = Field(min_length=1)

    @property
    def teams(self) -> list[RawTeamRef]:
        return [t.team for t in self.sports[0].leagues[0].teams]


class RawCompetitor(Raw):
    homeAway: Literal["home", "away"]
    team: RawTeamRef


class RawCompetition(Raw):
    competitors: list[RawCompetitor] = Field(min_length=2, max_length=2)


class RawSeasonType(Raw):
    type: int


class RawEvent(Raw):
    id: str
    date: str
    timeValid: bool = True
    seasonType: RawSeasonType
    competitions: list[RawCompetition] = Field(min_length=1)


class RawTeamSchedule(Raw):
    team: RawTeamRef
    events: list[RawEvent]


class RawPosition(Raw):
    abbreviation: str


class RawExperience(Raw):
    years: int


class RawHeadshot(Raw):
    href: str


class RawAthlete(Raw):
    id: str
    displayName: str
    age: Optional[int] = None
    dateOfBirth: Optional[str] = None
    experience: Optional[RawExperience] = None
    position: Optional[RawPosition] = None
    headshot: Optional[RawHeadshot] = None


class RawRoster(Raw):
    team: RawTeamRef
    athletes: list[RawAthlete]


class RawStatCategory(Raw):
    name: str
    names: list[str]


class RawAthleteStats(Raw):
    class _Athlete(Raw):
        id: str
        displayName: str

    class _Values(Raw):
        name: str
        values: list[Optional[float]]

    athlete: _Athlete
    categories: list[_Values]


class RawPagination(Raw):
    count: int
    page: int
    pages: int


class RawStatsByAthlete(Raw):
    """Before a season's first game ESPN returns only `currentSeason`."""

    pagination: Optional[RawPagination] = None
    categories: list[RawStatCategory] = []
    athletes: list[RawAthleteStats] = []


class RawInjury(Raw):
    class _Athlete(Raw):
        class _Link(Raw):
            href: str

        displayName: str
        links: list[_Link] = []

    status: str
    date: str
    shortComment: Optional[str] = None
    athlete: _Athlete


class RawTeamInjuries(Raw):
    id: str
    displayName: str
    injuries: list[RawInjury]


class RawInjuries(Raw):
    injuries: list[RawTeamInjuries]


# ---------------------------------------------------------------- fetchers


class Espn:
    name = "espn"

    def __init__(self, http: HttpClient, teams: TeamIndex):
        self.http = http
        self.teams = teams

    def probe(self) -> None:
        """Cheapest request that proves the host is reachable and the schema holds."""
        self.fetch_teams()

    def fetch_teams(self) -> RawTeams:
        return RawTeams.model_validate(self.http.get_json(f"{SITE}/teams", archive_as="espn-teams").data)

    def fetch_team_schedule(self, espn_team_id: str, season: int) -> RawTeamSchedule:
        url = f"{SITE}/teams/{espn_team_id}/schedule?season={season}&seasontype={REGULAR_SEASON}"
        return RawTeamSchedule.model_validate(
            self.http.get_json(url, archive_as=f"espn-schedule-{espn_team_id}").data
        )

    def fetch_roster(self, espn_team_id: str) -> RawRoster:
        url = f"{SITE}/teams/{espn_team_id}/roster"
        return RawRoster.model_validate(self.http.get_json(url, archive_as=f"espn-roster-{espn_team_id}").data)

    def fetch_stats(self, season: int) -> list[RawStatsByAthlete]:
        def page_url(page: int) -> str:
            return f"{COMMON}/statistics/byathlete?season={season}&seasontype={REGULAR_SEASON}&limit=1000&page={page}"

        first = RawStatsByAthlete.model_validate(
            self.http.get_json(page_url(1), archive_as=f"espn-stats-{season}-1").data
        )
        pages = [first]
        total = first.pagination.pages if first.pagination else 1
        for page in range(2, total + 1):
            pages.append(
                RawStatsByAthlete.model_validate(
                    self.http.get_json(page_url(page), archive_as=f"espn-stats-{season}-{page}").data
                )
            )
        return pages

    def fetch_injuries(self) -> RawInjuries:
        return RawInjuries.model_validate(self.http.get_json(f"{SITE}/injuries", archive_as="espn-injuries").data)

    # ------------------------------------------------------------ normalise

    def team_id(self, abbreviation: str) -> str:
        return self.teams.id_for(ESPN_TO_TRICODE.get(abbreviation, abbreviation))

    def schedule(self, season: int) -> list[ScheduledGame]:
        """Full regular season, deduplicated across the 30 team schedules."""
        games: dict[str, ScheduledGame] = {}
        for team in self.fetch_teams().teams:
            for event in self.fetch_team_schedule(team.id, season).events:
                if event.seasonType.type != REGULAR_SEASON:
                    continue
                comps = event.competitions[0].competitors
                home = next(c for c in comps if c.homeAway == "home")
                away = next(c for c in comps if c.homeAway == "away")
                games[event.id] = ScheduledGame(
                    id=f"espn:{event.id}",
                    datetime=datetime.fromisoformat(event.date.replace("Z", "+00:00")),
                    homeTeamId=self.team_id(home.team.abbreviation),
                    awayTeamId=self.team_id(away.team.abbreviation),
                    timeValid=event.timeValid,
                )
        return sorted(games.values(), key=lambda g: (g.datetime, g.id))

    def rosters(self) -> list[dict]:
        """Bios for every rostered player (dicts; merged with stats before validation)."""
        out: list[dict] = []
        for team in self.fetch_teams().teams:
            roster = self.fetch_roster(team.id)
            team_id = self.team_id(roster.team.abbreviation)
            for a in roster.athletes:
                out.append(
                    {
                        "id": f"espn:{a.id}",
                        "espnId": a.id,
                        "nbaId": None,
                        "name": a.displayName,
                        "teamId": team_id,
                        "position": a.position.abbreviation if a.position else None,
                        "dateOfBirth": a.dateOfBirth[:10] if a.dateOfBirth else None,
                        "age": a.age,
                        "experience": a.experience.years if a.experience else None,
                        "draftYear": None,
                        "draftRound": None,
                        "draftPick": None,
                        "headshotUrl": a.headshot.href if a.headshot else None,
                    }
                )
        return out

    @staticmethod
    def season_stats(pages: list[RawStatsByAthlete], season_label: str) -> list[PlayerSeasonStats]:
        """Flatten ESPN's parallel names/values arrays into per-game averages."""
        out: list[PlayerSeasonStats] = []
        for page in pages:
            names = {c.name: c.names for c in page.categories}
            for a in page.athletes:
                v: dict[str, float] = {}
                for cat in a.categories:
                    for key, val in zip(names.get(cat.name, []), cat.values):
                        if val is not None:
                            v[key] = val

                def pct(key: str) -> float:
                    return round(v.get(key, 0.0) / 100, 4)

                def avg(key: str) -> float:
                    return round(v.get(key, 0.0), 3)

                out.append(
                    PlayerSeasonStats(
                        playerId=f"espn:{a.athlete.id}",
                        season=season_label,
                        gp=int(v.get("gamesPlayed", 0)),
                        min=avg("avgMinutes"),
                        pts=avg("avgPoints"),
                        reb=avg("avgRebounds"),
                        ast=avg("avgAssists"),
                        stl=avg("avgSteals"),
                        blk=avg("avgBlocks"),
                        tov=avg("avgTurnovers"),
                        fgm=avg("avgFieldGoalsMade"),
                        fga=avg("avgFieldGoalsAttempted"),
                        fg3m=avg("avgThreePointFieldGoalsMade"),
                        fg3a=avg("avgThreePointFieldGoalsAttempted"),
                        ftm=avg("avgFreeThrowsMade"),
                        fta=avg("avgFreeThrowsAttempted"),
                        fgPct=pct("fieldGoalPct"),
                        ftPct=pct("freeThrowPct"),
                        fg3Pct=pct("threePointFieldGoalPct"),
                    )
                )
        return out

    def injuries(self) -> list[InjuryItem]:
        espn_team_to_nba = {t.id: self.team_id(t.abbreviation) for t in self.fetch_teams().teams}
        items: dict[str, InjuryItem] = {}
        for team in self.fetch_injuries().injuries:
            for i in team.injuries:
                href = i.athlete.links[0].href if i.athlete.links else ""
                match = re.search(r"/id/(\d+)", href)
                player_id = f"espn:{match.group(1)}" if match else f"espn-name:{i.athlete.displayName}"
                items[player_id] = InjuryItem(
                    playerId=player_id,
                    playerName=i.athlete.displayName,
                    teamId=espn_team_to_nba.get(team.id),
                    status=i.status,
                    date=i.date,
                    comment=i.shortComment,
                )
        return sorted(items.values(), key=lambda x: (x.teamId or "", x.playerName))


def to_player_record(bio: dict, stats: PlayerSeasonStats | None) -> PlayerRecord:
    return PlayerRecord(**bio, isRookie=bio.get("experience") == 0, stats=stats)
