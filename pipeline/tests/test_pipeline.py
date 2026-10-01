"""Fast offline tests for the rules that are easy to break silently."""

from datetime import date, datetime, timedelta, timezone

import pytest

from backboard_pipeline import quality, storage
from backboard_pipeline.models import ScheduledGame
from backboard_pipeline.weeks import build_yahoo_weeks

HOME, AWAY = "1610612737", "1610612738"


def game(day: date, n: int = 0) -> ScheduledGame:
    # 7:30pm ET ≈ 23:30 UTC
    tip = datetime(day.year, day.month, day.day, 23, 30, tzinfo=timezone.utc)
    return ScheduledGame(id=f"espn:{day:%Y%m%d}{n}", datetime=tip, homeTeamId=HOME, awayTeamId=AWAY, timeValid=True)


def season(start: date, end: date, skip: set[date] = frozenset()) -> list[ScheduledGame]:
    days = [start + timedelta(d) for d in range((end - start).days + 1)]
    return [game(d) for d in days if d not in skip]


def test_yahoo_weeks_short_opener_and_all_star_merge():
    # Mirrors 2025-26: opener Tue Oct 21, All-Star break Feb 13–18, last day Sun Apr 12.
    brk = {date(2026, 2, 13) + timedelta(d) for d in range(6)}
    weeks = build_yahoo_weeks(season(date(2025, 10, 21), date(2026, 4, 12), brk))
    assert (weeks[0].start_date, weeks[0].end_date, weeks[0].notes) == ("2025-10-21", "2025-10-26", "Short week")
    extended = [w for w in weeks if w.notes == "Extended week"]
    assert [(w.start_date, w.end_date) for w in extended] == [("2026-02-09", "2026-02-22")]
    assert weeks[-1].end_date == "2026-04-12"
    assert len(weeks) == 24


def test_december_gap_is_not_treated_as_all_star_break():
    gap = {date(2026, 12, 4) + timedelta(d) for d in range(8)}
    weeks = build_yahoo_weeks(season(date(2026, 10, 20), date(2027, 1, 31), gap))
    assert not any(w.notes == "Extended week" for w in weeks)


def test_same_team_cannot_be_home_and_away():
    with pytest.raises(ValueError):
        ScheduledGame(id="espn:1", datetime=datetime.now(timezone.utc), homeTeamId=HOME, awayTeamId=HOME, timeValid=True)


def test_datetime_serialises_like_javascript():
    g = game(date(2026, 10, 20))
    assert g.model_dump(mode="json")["datetime"] == "2026-10-20T23:30:00.000Z"


def test_volume_drop_blocks_publish():
    assert quality.has_errors(quality.check_volume("players", 300, 600, max_drop_pct=20))
    assert not quality.check_volume("players", 590, 600, max_drop_pct=20)


def test_crosscheck_pairs_by_matchup_and_flags_time_changes():
    a = [game(date(2026, 10, 20)), game(date(2026, 10, 22))]
    moved = game(date(2026, 10, 22)).model_copy(update={"datetime": a[1].datetime + timedelta(hours=1), "id": "nba:2"})
    issues, summary = quality.check_crosscheck(a, [a[0].model_copy(update={"id": "nba:1"}), moved], max_pct=100)
    assert summary == {"exact": 1, "timeChanged": 1, "primaryOnly": 0, "referenceOnly": 0}
    assert issues and issues[0].level == "warning"


def test_atomic_write_and_lock(tmp_path):
    storage.write_json(tmp_path / "x.json", {"a": 1})
    assert storage.read_json(tmp_path / "x.json") == {"a": 1}
    assert not list(tmp_path.glob(".*.tmp"))
    with storage.run_lock(tmp_path):
        with pytest.raises(storage.AlreadyRunning):
            with storage.run_lock(tmp_path):
                pass
