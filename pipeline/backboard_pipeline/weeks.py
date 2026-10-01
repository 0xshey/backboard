"""Yahoo-style fantasy weeks derived from the schedule.

Yahoo doesn't publish NBA week windows without an OAuth app, so we reproduce
its rules. These matched Yahoo's real 2025-26 weeks exactly (24/24):

1. Weeks run Monday–Sunday, US Eastern.
2. Week 1 starts on opening night and ends that Sunday ("Short week").
3. Every Monday week the All-Star break touches is merged ("Extended week").
4. The last week ends on the final day of the regular season.

Mirrors src/lib/sources/fantasy-weeks.ts.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Iterable
from zoneinfo import ZoneInfo

from .models import FantasyWeek, ScheduledGame

ET = ZoneInfo("America/New_York")


def et_dates(games: Iterable[ScheduledGame]) -> list[date]:
    return sorted({g.datetime.astimezone(ET).date() for g in games})


def find_all_star_break(game_days: set[date], first: date, last: date) -> tuple[date, date] | None:
    """Longest run of 3+ idle days in February (ignores the December NBA Cup gap)."""
    best: tuple[date, date] | None = None
    run_start: date | None = None
    day = first
    while day <= last + timedelta(days=1):
        idle = day <= last and day not in game_days
        if idle and day.month == 2:
            run_start = run_start or day
        elif run_start:
            end = day - timedelta(days=1)
            length = (end - run_start).days + 1
            if length >= 3 and (best is None or length > (best[1] - best[0]).days + 1):
                best = (run_start, end)
            run_start = None
        day += timedelta(days=1)
    return best


def build_yahoo_weeks(games: list[ScheduledGame]) -> list[FantasyWeek]:
    days = et_dates(games)
    if not days:
        return []
    first, last = days[0], days[-1]

    weeks: list[tuple[date, date, str | None]] = []
    monday = first - timedelta(days=first.weekday())
    while monday <= last:
        start = max(monday, first)
        end = min(monday + timedelta(days=6), last)
        weeks.append((start, end, "Short week" if start > monday else None))
        monday += timedelta(weeks=1)

    brk = find_all_star_break(set(days), first, last)
    if brk:
        touched = [w for w in weeks if w[1] >= brk[0] and w[0] <= brk[1]]
        if len(touched) > 1:
            merged = (touched[0][0], touched[-1][1], "Extended week")
            weeks = [w for w in weeks if w[1] < merged[0]] + [merged] + [w for w in weeks if w[0] > merged[1]]

    return [
        FantasyWeek(number=i + 1, label=f"Week {i + 1}", start_date=s.isoformat(), end_date=e.isoformat(), notes=n)
        for i, (s, e, n) in enumerate(weeks)
    ]
