"""CLI.

    python -m backboard_pipeline run [--only schedule,players,injuries] [--dry-run] [--force]
    python -m backboard_pipeline probe
    python -m backboard_pipeline status [--max-age-hours 36]

Exit codes: 0 all datasets ok · 1 some dataset failed (last good data kept) ·
2 configuration error · 75 another run is in progress (EX_TEMPFAIL).
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
from datetime import datetime, timezone

import requests

from .config import ALL_DATASETS, Settings
from .pipeline import MANIFEST, Pipeline
from .storage import AlreadyRunning, read_json, run_lock, seed_if_empty

log = logging.getLogger("backboard_pipeline")


def ping(settings: Settings, suffix: str = "", body: str = "") -> None:
    """healthchecks.io-style pings: <url>/start, <url>, <url>/fail. Never fatal."""
    if not settings.healthcheck_url:
        return
    try:
        requests.post(settings.healthcheck_url.rstrip("/") + suffix, data=body[:10000].encode(), timeout=10)
    except requests.RequestException as err:
        log.warning("healthcheck ping failed: %s", err)


def cmd_run(settings: Settings, args: argparse.Namespace) -> int:
    datasets = [d.strip() for d in args.only.split(",")] if args.only else list(ALL_DATASETS)
    unknown = set(datasets) - set(ALL_DATASETS)
    if unknown:
        log.error("unknown dataset(s): %s (choose from %s)", ", ".join(sorted(unknown)), ", ".join(ALL_DATASETS))
        return 2

    run_id = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    ping(settings, "/start")
    try:
        with run_lock(settings.data_dir):
            seed_if_empty(settings.data_dir, settings.seed_dir)
            pipeline = Pipeline(settings, run_id)
            results = pipeline.run(datasets, dry_run=args.dry_run, force=args.force)
            if not args.dry_run:
                pipeline.cleanup()
    except AlreadyRunning as err:
        log.warning("%s; skipping this run", err)
        return 75
    except RuntimeError as err:
        log.error("%s", err)
        ping(settings, "/fail", str(err))
        return 2

    failed = [r.name for r in results.values() if not r.ok]
    summary = ", ".join(f"{r.name}={'ok' if r.ok else 'FAILED'}({r.records})" for r in results.values())
    log.info("run %s finished: %s", run_id, summary)
    ping(settings, "/fail" if failed else "", summary)
    return 1 if failed else 0


def cmd_probe(settings: Settings, _: argparse.Namespace) -> int:
    seed_if_empty(settings.data_dir, settings.seed_dir)
    status = Pipeline(settings, "probe").probe(["espn", "espn-core", "nba-cdn"])
    print(json.dumps(status, indent=2))
    return 0 if status["espn"]["ok"] else 1


def cmd_status(settings: Settings, args: argparse.Namespace) -> int:
    manifest = read_json(settings.data_dir / MANIFEST)
    if not manifest:
        print(f"no {MANIFEST} in {settings.data_dir} yet")
        return 1
    print(f"season {manifest['season']} · updated {manifest['updatedAt']} · last run {manifest['lastRun']['status']}")
    for name, d in manifest["datasets"].items():
        print(f"  {name:9} {d.get('status', '?'):6} {d.get('records', '–'):>5} records · published {d.get('publishedAt', 'never')}"
              + (f" · last error: {d['lastError']}" if d.get("lastError") else ""))
    for name, s in manifest.get("sources", {}).items():
        print(f"  source {name:9} {'ok' if s['ok'] else 'DOWN'} (checked {s['checkedAt']})")

    if args.max_age_hours:
        now = datetime.now(timezone.utc)
        stale = [
            name
            for name, d in manifest["datasets"].items()
            if not d.get("publishedAt")
            or (now - datetime.fromisoformat(d["publishedAt"].replace("Z", "+00:00"))).total_seconds()
            > args.max_age_hours * 3600
        ]
        if stale:
            print(f"STALE (> {args.max_age_hours}h): {', '.join(stale)}")
            return 1
    return 0


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(
        level=os.environ.get("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%S%z",
        stream=sys.stdout,
    )
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    parser = argparse.ArgumentParser(prog="backboard_pipeline", description="Fetch, validate and publish Backboard data.")
    sub = parser.add_subparsers(dest="command", required=True)
    run = sub.add_parser("run", help="probe sources, fetch, validate and publish datasets")
    run.add_argument("--only", help=f"comma-separated subset of: {', '.join(ALL_DATASETS)}")
    run.add_argument("--dry-run", action="store_true", help="validate everything but publish nothing")
    run.add_argument("--force", action="store_true", help="publish despite data-quality errors (not fetch/schema errors)")
    sub.add_parser("probe", help="check each source is reachable and matches its schema")
    status = sub.add_parser("status", help="summarise manifest.json")
    status.add_argument("--max-age-hours", type=float, help="exit 1 if any dataset was published longer ago than this")
    args = parser.parse_args(argv)

    settings = Settings.from_env()
    return {"run": cmd_run, "probe": cmd_probe, "status": cmd_status}[args.command](settings, args)


if __name__ == "__main__":
    sys.exit(main())
