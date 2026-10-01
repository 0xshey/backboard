"""Run orchestration: probe → fetch → validate → stage → publish → manifest → cleanup.

Datasets are independent: one failing keeps its last good version live and
doesn't block the others.
"""

from __future__ import annotations

import logging
import shutil
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from pydantic import ValidationError

from . import quality, storage
from .config import Settings
from .http import HttpClient, SourceError
from .ids import resolve_nba_ids, supabase_name_index
from .models import FantasyWeek, PlayerRecord
from .quality import Issue, error, warning
from .sources.espn import Espn, to_player_record
from .sources.espn_core import EspnCore
from .sources.nba_cdn import NbaCdn
from .sources.teams import TeamIndex
from .weeks import build_yahoo_weeks

log = logging.getLogger(__name__)

MANIFEST = "manifest.json"
SCHEMA_VERSION = 1


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


@dataclass
class DatasetResult:
    name: str
    files: dict[str, Any] = field(default_factory=dict)  # filename → JSON payload
    records: int = 0
    source: str = "espn"
    issues: list[Issue] = field(default_factory=list)
    details: dict[str, Any] = field(default_factory=dict)
    exception: str | None = None

    @property
    def ok(self) -> bool:
        return self.exception is None and not quality.has_errors(self.issues)


class Pipeline:
    def __init__(self, settings: Settings, run_id: str):
        self.s = settings
        self.run_id = run_id
        self.http = HttpClient(settings.request_interval, settings.timeout, raw_dir=settings.raw_dir / run_id)
        teams_rows = storage.read_json(settings.data_dir / "teams.json")
        if not teams_rows:
            raise RuntimeError(f"{settings.data_dir / 'teams.json'} is missing; set SEED_DIR or copy it in")
        self.teams = TeamIndex.from_rows(teams_rows)
        self.team_ids = set(self.teams.by_id)
        self.espn = Espn(self.http, self.teams)
        self.core = EspnCore(self.http)
        self.cdn = NbaCdn(self.http)
        self.source_status: dict[str, dict] = {}

    # ------------------------------------------------------------ probing

    def probe(self, names: list[str]) -> dict[str, dict]:
        sources = {"espn": self.espn, "espn-core": self.core, "nba-cdn": self.cdn}
        for name in names:
            started = datetime.now(timezone.utc)
            try:
                sources[name].probe()
                status = {"ok": True, "error": None}
            except (SourceError, ValidationError) as err:
                status = {"ok": False, "error": _short(err)}
            status["checkedAt"] = now_iso()
            status["ms"] = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
            self.source_status[name] = status
            log.info("probe %-9s %s %s", name, "ok" if status["ok"] else "FAILED", status["error"] or "")
        return self.source_status

    def source_ok(self, name: str) -> bool:
        return self.source_status.get(name, {}).get("ok", False)

    # ------------------------------------------------------------ datasets

    def previous(self, filename: str) -> Any:
        return storage.read_json(self.s.data_dir / filename)

    def build_schedule(self, r: DatasetResult) -> None:
        label = self.s.season_label
        games = self.espn.schedule(self.s.season)
        r.records = len(games)
        r.issues += quality.check_schedule(games, self.team_ids, self.s.season)
        prev = self.previous(f"schedule-{label}.json")
        r.issues += quality.check_volume("schedule", len(games), len(prev["games"]) if prev else None, self.s.max_drop_pct)

        if self.source_ok("nba-cdn"):
            reference = self.cdn.schedule()
            issues, summary = quality.check_crosscheck(games, reference, self.s.max_disagreement_pct)
            r.issues += issues
            r.details["crosscheck"] = {"reference": "nba-cdn", **summary}
        else:
            r.issues.append(warning("crosscheck_skipped", "nba-cdn unavailable; schedule not cross-checked"))
            r.details["crosscheck"] = None

        weeks_file = f"fantasy-weeks-{label}.json"
        if self.s.weeks_auto:
            weeks = build_yahoo_weeks(games)
        else:
            weeks = [FantasyWeek.model_validate(w) for w in (self.previous(weeks_file) or [])]
        r.issues += quality.check_weeks(weeks, games)
        r.details["weeks"] = len(weeks)

        r.files[f"schedule-{label}.json"] = {
            "source": "espn",
            "fetchedAt": now_iso(),
            "season": label,
            "games": [g.model_dump(mode="json") for g in games],
        }
        if self.s.weeks_auto:
            r.files[weeks_file] = [w.model_dump(mode="json") for w in weeks]

    def build_players(self, r: DatasetResult) -> None:
        label = self.s.season_label
        filename = f"players-{label}.json"
        prev = self.previous(filename) or {"players": []}
        prev_by_espn = {p["espnId"]: p for p in prev["players"] if p.get("espnId")}

        bios = self.espn.rosters()

        # Stats: current season once games are played, otherwise last season.
        stats_season = self.s.season
        stats = [s for s in Espn.season_stats(self.espn.fetch_stats(stats_season), label) if s.gp > 0]
        if not stats:
            stats_season = self.s.season - 1
            prev_label = f"{stats_season - 1}-{stats_season % 100:02d}"
            stats = Espn.season_stats(self.espn.fetch_stats(stats_season), prev_label)
        stats_by_id = {s.playerId: s for s in stats}

        # Draft info never changes: reuse it, only ask espn-core about new rookies.
        enriched = failed = 0
        for i, bio in enumerate(bios):
            old = prev_by_espn.get(bio["espnId"])
            if old and old.get("draftYear"):
                bios[i] = {**bio, **{k: old[k] for k in ("draftYear", "draftRound", "draftPick")}}
            elif self.s.fetch_draft and self.source_ok("espn-core") and bio["experience"] == 0:
                try:
                    bios[i] = self.core.enrich(bio)
                    enriched += 1
                except (SourceError, ValidationError):
                    failed += 1
        if failed:
            r.issues.append(warning("draft_enrichment", f"draft lookup failed for {failed} rookies"))

        # NBA ids for headshots.
        overrides = storage.read_json(self.s.data_dir / "player-id-overrides.json") or {}
        previous_ids = {k: v["nbaId"] for k, v in prev_by_espn.items() if v.get("nbaId")}
        name_index: dict[str, str] = {}
        unresolved = [b for b in bios if b["espnId"] not in overrides and b["espnId"] not in previous_ids]
        if unresolved and self.s.supabase_url and self.s.supabase_key:
            try:
                name_index = supabase_name_index(self.http, self.s.supabase_url, self.s.supabase_key)
            except SourceError as err:
                r.issues.append(warning("id_match", f"Supabase name lookup failed: {_short(err)}"))
        r.details["nbaIds"] = resolve_nba_ids(bios, overrides, previous_ids, name_index)

        # Row-level validation: drop bad rows, but fail if too many are bad.
        players: list[PlayerRecord] = []
        rejected: list[str] = []
        for bio in bios:
            try:
                players.append(to_player_record(bio, stats_by_id.get(bio["id"])))
            except ValidationError as err:
                rejected.append(f"{bio.get('name')}: {_short(err)}")
        if rejected:
            level = error if len(rejected) > len(bios) * 0.02 else warning
            r.issues.append(level("rejected_rows", f"{len(rejected)} invalid player rows dropped, e.g. {rejected[0]}"))

        players.sort(key=lambda p: (p.teamId or "", p.name))
        r.records = len(players)
        r.issues += quality.check_players(players, self.team_ids)
        r.issues += quality.check_volume("players", len(players), len(prev["players"]) or None, self.s.max_drop_pct)
        r.details.update(statsSeason=stats_season, withStats=sum(1 for p in players if p.stats), draftLookups=enriched)
        r.files[filename] = {
            "source": "espn",
            "fetchedAt": now_iso(),
            "season": label,
            "statsSeason": f"{stats_season - 1}-{stats_season % 100:02d}",
            "players": [p.model_dump(mode="json") for p in players],
        }

    def build_injuries(self, r: DatasetResult) -> None:
        items = self.espn.injuries()
        r.records = len(items)
        r.issues += quality.check_injuries(items)
        r.files["injuries.json"] = {
            "source": "espn",
            "fetchedAt": now_iso(),
            "injuries": [i.model_dump(mode="json") for i in items],
        }

    # ------------------------------------------------------------ run

    def run(self, datasets: list[str], dry_run: bool = False, force: bool = False) -> dict[str, DatasetResult]:
        needed = ["espn"]
        if "players" in datasets and self.s.fetch_draft:
            needed.append("espn-core")
        if "schedule" in datasets:
            needed.append("nba-cdn")
        self.probe(needed)

        builders: dict[str, Callable[[DatasetResult], None]] = {
            "schedule": self.build_schedule,
            "players": self.build_players,
            "injuries": self.build_injuries,
        }
        results: dict[str, DatasetResult] = {}
        for name in datasets:
            r = DatasetResult(name)
            results[name] = r
            if not self.source_ok("espn"):
                r.exception = f"espn unavailable: {self.source_status['espn']['error']}"
            else:
                try:
                    builders[name](r)
                except (SourceError, ValidationError, ValueError, KeyError) as err:
                    r.exception = _short(err)
                    log.exception("%s: build failed", name)
            for issue in r.issues:
                log.log(logging.ERROR if issue.level == "error" else logging.WARNING, "%s: %s %s", name, issue.code, issue.message)
            log.info("%s: %s (%d records)", name, "ok" if r.ok else "FAILED", r.records)

        staging = self.s.staging_dir / self.run_id
        try:
            staged: dict[str, Path] = {}
            for r in results.values():
                if not (r.ok or (force and r.exception is None)):
                    continue
                for filename, payload in r.files.items():
                    path = staging / filename
                    storage.write_json(path, payload)
                    staged[filename] = path
            if dry_run:
                log.info("dry run: validated %d files, nothing published", len(staged))
            else:
                if staged:
                    storage.publish(staged, self.s.data_dir, self.s.history_dir / self.run_id)
                    log.info("published %s", ", ".join(sorted(staged)))
                self.update_manifest(results, force)
        finally:
            shutil.rmtree(staging, ignore_errors=True)
        return results

    def update_manifest(self, results: dict[str, DatasetResult], force: bool) -> None:
        path = self.s.data_dir / MANIFEST
        manifest = storage.read_json(path) or {}
        datasets = manifest.get("datasets", {})
        for r in results.values():
            entry = datasets.get(r.name, {})
            entry.update(lastAttempt=now_iso(), lastRunId=self.run_id, lastError=r.exception)
            if r.ok or (force and r.exception is None):
                entry.update(
                    status="ok" if r.ok else "forced",
                    source=r.source,
                    publishedAt=now_iso(),
                    records=r.records,
                    issues=[i.to_dict() for i in r.issues],
                    details=r.details,
                    files={
                        f: {"sha256": storage.sha256(self.s.data_dir / f), "bytes": (self.s.data_dir / f).stat().st_size}
                        for f in r.files
                    },
                )
            else:
                entry.update(status="stale", lastIssues=[i.to_dict() for i in r.issues])
            datasets[r.name] = entry
        storage.write_json(
            path,
            {
                "schemaVersion": SCHEMA_VERSION,
                "season": self.s.season_label,
                "updatedAt": now_iso(),
                "lastRun": {
                    "id": self.run_id,
                    "status": "ok" if all(r.ok for r in results.values()) else "partial",
                    "datasets": {r.name: ("ok" if r.ok else "failed") for r in results.values()},
                },
                "sources": {**manifest.get("sources", {}), **self.source_status},
                "datasets": datasets,
            },
        )

    def cleanup(self) -> None:
        removed = storage.prune_dirs(self.s.history_dir, keep=self.s.keep_history)
        removed += storage.prune_dirs(self.s.raw_dir, max_age_days=self.s.keep_raw_days)
        removed += storage.prune_dirs(self.s.staging_dir, max_age_days=1)
        stray = storage.remove_stray_temp_files(self.s.data_dir)
        log.info("cleanup: removed %d old run folders, %d stray temp files", removed, stray)


def _short(err: Exception) -> str:
    if isinstance(err, ValidationError):
        first = err.errors()[0]
        return f"{err.error_count()} validation error(s); first: {'.'.join(map(str, first['loc']))}: {first['msg']}"
    return str(err)
