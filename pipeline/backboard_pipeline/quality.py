"""Data-quality checks run after schema validation and before publishing.

Each check returns Issues. Any `error` blocks publishing that dataset (the last
good version stays live); `warning`s are recorded in the manifest.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import asdict, dataclass
from datetime import timedelta
from typing import Literal

from .models import FantasyWeek, InjuryItem, PlayerRecord, ScheduledGame
from .weeks import ET, et_dates


@dataclass(frozen=True)
class Issue:
    level: Literal["error", "warning"]
    code: str
    message: str

    def to_dict(self) -> dict:
        return asdict(self)


def error(code: str, message: str) -> Issue:
    return Issue("error", code, message)


def warning(code: str, message: str) -> Issue:
    return Issue("warning", code, message)


def has_errors(issues: list[Issue]) -> bool:
    return any(i.level == "error" for i in issues)


def check_volume(name: str, new_count: int, previous_count: int | None, max_drop_pct: float) -> list[Issue]:
    """Guard against publishing a partial fetch over a complete one."""
    if not previous_count:
        return []
    drop = (previous_count - new_count) / previous_count * 100
    if drop > max_drop_pct:
        return [error("volume_drop", f"{name}: {new_count} records vs {previous_count} last time (-{drop:.0f}%)")]
    return []


def check_schedule(games: list[ScheduledGame], team_ids: set[str], season: int) -> list[Issue]:
    issues: list[Issue] = []
    if len(games) < 1000:
        issues.append(error("too_few_games", f"{len(games)} games; a full season has ~1,230"))

    dupes = [k for k, n in Counter(g.id for g in games).items() if n > 1]
    if dupes:
        issues.append(error("duplicate_ids", f"{len(dupes)} duplicate game ids, e.g. {dupes[0]}"))

    unknown = {t for g in games for t in (g.homeTeamId, g.awayTeamId)} - team_ids
    if unknown:
        issues.append(error("unknown_team", f"unknown team ids: {sorted(unknown)}"))

    per_team = Counter(t for g in games for t in (g.homeTeamId, g.awayTeamId))
    low = {t: n for t, n in per_team.items() if n < 78 or n > 82}
    if low:
        issues.append(warning("games_per_team", f"teams outside 78–82 games: {low} (NBA Cup games are added in December)"))

    same_day = Counter((t, g.datetime.astimezone(ET).date()) for g in games for t in (g.homeTeamId, g.awayTeamId))
    doubles = [k for k, n in same_day.items() if n > 1]
    if doubles:
        issues.append(error("double_booked", f"{len(doubles)} team-days with 2+ games, e.g. {doubles[0]}"))

    days = et_dates(games)
    if days and not (days[0].year == season - 1 and days[0].month >= 9 and days[-1].year == season and days[-1].month <= 5):
        issues.append(error("season_window", f"games run {days[0]} → {days[-1]}, outside the {season - 1}-{season} season"))

    tbd = sum(1 for g in games if not g.timeValid)
    if tbd:
        issues.append(warning("tbd_times", f"{tbd} games without a confirmed tip time"))
    return issues


def check_weeks(weeks: list[FantasyWeek], games: list[ScheduledGame]) -> list[Issue]:
    issues: list[Issue] = []
    if not weeks:
        return [error("no_weeks", "no fantasy weeks")]
    if [w.number for w in weeks] != list(range(1, len(weeks) + 1)):
        issues.append(error("week_numbers", "week numbers are not 1..n"))
    for prev, cur in zip(weeks, weeks[1:]):
        if cur.start_date <= prev.end_date:
            issues.append(error("week_overlap", f"week {cur.number} overlaps week {prev.number}"))
    days = et_dates(games)
    if days and (days[0].isoformat() < weeks[0].start_date or days[-1].isoformat() > weeks[-1].end_date):
        issues.append(error("week_coverage", "fantasy weeks don't cover every game day"))
    for w in weeks:
        length = (_d(w.end_date) - _d(w.start_date)).days + 1
        if length > 14:
            issues.append(warning("long_week", f"week {w.number} is {length} days"))
    return issues


def check_players(players: list[PlayerRecord], team_ids: set[str]) -> list[Issue]:
    issues: list[Issue] = []
    if len(players) < 400:
        issues.append(error("too_few_players", f"{len(players)} players; ~450–650 expected"))
    dupes = [k for k, n in Counter(p.id for p in players).items() if n > 1]
    if dupes:
        issues.append(error("duplicate_ids", f"{len(dupes)} duplicate player ids, e.g. {dupes[0]}"))
    unknown = {p.teamId for p in players if p.teamId} - team_ids
    if unknown:
        issues.append(error("unknown_team", f"unknown team ids: {sorted(unknown)}"))
    per_team = Counter(p.teamId for p in players)
    odd = {t: n for t, n in per_team.items() if not 12 <= n <= 25}
    if odd:
        issues.append(warning("roster_size", f"unusual roster sizes: {odd}"))
    with_stats = sum(1 for p in players if p.stats)
    if with_stats < 300:
        issues.append(warning("few_stats", f"only {with_stats} players have season stats"))
    nba_dupes = [k for k, n in Counter(p.nbaId for p in players if p.nbaId).items() if n > 1]
    if nba_dupes:
        issues.append(error("duplicate_nba_ids", f"NBA id matched to 2+ players: {nba_dupes[:3]}"))
    return issues


def check_injuries(items: list[InjuryItem]) -> list[Issue]:
    known = {"Out", "Day-To-Day", "Questionable", "Doubtful", "Probable", "Suspension"}
    odd = {i.status for i in items} - known
    return [warning("injury_status", f"unrecognised statuses: {sorted(odd)}")] if odd else []


def check_crosscheck(primary: list[ScheduledGame], reference: list[ScheduledGame], max_pct: float) -> tuple[list[Issue], dict]:
    """Pair games by matchup + closest tip (<24h). Different sources use different ids."""
    pool: dict[tuple[str, str], list[ScheduledGame]] = {}
    for g in reference:
        pool.setdefault((g.homeTeamId, g.awayTeamId), []).append(g)
    exact = time_changed = missing = 0
    for g in primary:
        candidates = pool.get((g.homeTeamId, g.awayTeamId), [])
        match = next((c for c in candidates if c.datetime == g.datetime), None)
        if match:
            exact += 1
        else:
            match = next((c for c in candidates if abs(c.datetime - g.datetime) < timedelta(hours=24)), None)
            if match:
                time_changed += 1
            else:
                missing += 1
                continue
        candidates.remove(match)
    extra = sum(len(v) for v in pool.values())
    summary = {"exact": exact, "timeChanged": time_changed, "primaryOnly": missing, "referenceOnly": extra}
    disagree = time_changed + missing + extra
    pct = disagree / max(len(primary), 1) * 100
    if pct > max_pct:
        return [error("crosscheck", f"{disagree} games disagree with the reference source ({pct:.1f}%)")], summary
    if disagree:
        return [warning("crosscheck", f"{disagree} games differ from the reference source: {summary}")], summary
    return [], summary


def _d(s: str):
    from datetime import date

    return date.fromisoformat(s)
