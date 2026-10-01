"""Filesystem layer: locking, atomic publishing, history, manifest and cleanup.

Layout under DATA_DIR:
    teams.json, schedule-<season>.json, ...   live files the app reads
    manifest.json                             run + per-dataset metadata
    _staging/<run>/                           candidate files for this run
    _history/<run>/                           previous versions replaced by <run>
    _raw/<run>/*.json.gz                      raw API responses from <run>
    .pipeline.lock                            prevents overlapping runs
"""

from __future__ import annotations

import fcntl
import hashlib
import json
import logging
import os
import shutil
import tempfile
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

log = logging.getLogger(__name__)


class AlreadyRunning(Exception):
    pass


@contextmanager
def run_lock(data_dir: Path) -> Iterator[None]:
    data_dir.mkdir(parents=True, exist_ok=True)
    with open(data_dir / ".pipeline.lock", "w") as fh:
        try:
            fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise AlreadyRunning("another pipeline run holds the lock") from None
        fh.write(str(os.getpid()))
        fh.flush()
        try:
            yield
        finally:
            fcntl.flock(fh, fcntl.LOCK_UN)


def read_json(path: Path) -> Any | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None


def dumps(data: Any) -> str:
    # Tabs + trailing newline to match the repo's committed JSON.
    return json.dumps(data, indent="\t", ensure_ascii=False) + "\n"


def write_json(path: Path, data: Any) -> None:
    """Atomic write: temp file in the same directory, fsync, then rename."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(dumps(data))
            fh.flush()
            os.fsync(fh.fileno())
        os.chmod(tmp, 0o644)
        os.replace(tmp, path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def seed_if_empty(data_dir: Path, seed_dir: Path | None) -> None:
    """First run on a fresh volume: copy the bundled data so the app has something to serve."""
    if not seed_dir or not seed_dir.is_dir() or (data_dir / "teams.json").exists():
        return
    data_dir.mkdir(parents=True, exist_ok=True)
    for src in seed_dir.glob("*.json"):
        if not src.name.startswith("_"):
            shutil.copy2(src, data_dir / src.name)
    log.info("seeded %s from %s", data_dir, seed_dir)


def publish(staged: dict[str, Path], data_dir: Path, history_dir: Path) -> None:
    """Back up the current live files, then atomically swap in the staged ones."""
    for name, src in staged.items():
        live = data_dir / name
        if live.exists():
            history_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(live, history_dir / name)
        tmp = data_dir / f".{name}.publish.tmp"
        shutil.copy2(src, tmp)
        os.replace(tmp, live)


def prune_dirs(parent: Path, keep: int | None = None, max_age_days: int | None = None) -> int:
    """Delete old run directories (names sort chronologically)."""
    if not parent.is_dir():
        return 0
    dirs = sorted(p for p in parent.iterdir() if p.is_dir())
    doomed: set[Path] = set()
    if keep is not None and len(dirs) > keep:
        doomed.update(dirs[: len(dirs) - keep])
    if max_age_days is not None:
        cutoff = time.time() - max_age_days * 86400
        doomed.update(d for d in dirs if d.stat().st_mtime < cutoff)
    for d in doomed:
        shutil.rmtree(d, ignore_errors=True)
    return len(doomed)


def remove_stray_temp_files(data_dir: Path) -> int:
    """Leftovers from a run that was killed mid-write."""
    count = 0
    for tmp in data_dir.glob(".*.tmp"):
        tmp.unlink(missing_ok=True)
        count += 1
    return count
