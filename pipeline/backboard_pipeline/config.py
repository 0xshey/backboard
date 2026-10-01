"""Settings, read from environment variables (12-factor style)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

ALL_DATASETS = ("schedule", "players", "injuries")


def _env(name: str, default: str | None = None) -> str | None:
    value = os.environ.get(name)
    return value if value not in (None, "") else default


def _env_int(name: str, default: int) -> int:
    return int(_env(name, str(default)))  # type: ignore[arg-type]


def _env_float(name: str, default: float) -> float:
    return float(_env(name, str(default)))  # type: ignore[arg-type]


def _env_bool(name: str, default: bool) -> bool:
    return (_env(name, str(default)) or "").lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Settings:
    data_dir: Path
    """Where published JSON lives (shared with the app container)."""
    seed_dir: Path | None
    """Bundled data copied into an empty data_dir on first run."""
    season: int
    """ESPN season id = the year the season ends (2027 → 2026-27)."""
    weeks_auto: bool
    """Regenerate fantasy weeks from the schedule. False keeps a hand-edited file."""
    keep_history: int
    """How many previous versions of each run's published files to keep."""
    keep_raw_days: int
    """How long to keep raw API responses (for debugging and audits)."""
    max_drop_pct: float
    """Refuse to publish a dataset that shrank by more than this vs the last version."""
    max_disagreement_pct: float
    """Schedule cross-check tolerance before failing the dataset."""
    request_interval: float
    timeout: float
    fetch_draft: bool
    supabase_url: str | None
    supabase_key: str | None
    healthcheck_url: str | None

    @property
    def season_label(self) -> str:
        return f"{self.season - 1}-{self.season % 100:02d}"

    @property
    def history_dir(self) -> Path:
        return self.data_dir / "_history"

    @property
    def raw_dir(self) -> Path:
        return self.data_dir / "_raw"

    @property
    def staging_dir(self) -> Path:
        return self.data_dir / "_staging"

    @classmethod
    def from_env(cls) -> "Settings":
        seed = _env("SEED_DIR")
        return cls(
            data_dir=Path(_env("DATA_DIR", "data")).resolve(),  # type: ignore[arg-type]
            seed_dir=Path(seed).resolve() if seed else None,
            season=_env_int("SEASON", 2027),
            weeks_auto=_env_bool("WEEKS_AUTO", True),
            keep_history=_env_int("KEEP_HISTORY", 14),
            keep_raw_days=_env_int("KEEP_RAW_DAYS", 7),
            max_drop_pct=_env_float("MAX_DROP_PCT", 20.0),
            max_disagreement_pct=_env_float("MAX_DISAGREEMENT_PCT", 2.0),
            request_interval=_env_float("REQUEST_INTERVAL", 1.0),
            timeout=_env_float("REQUEST_TIMEOUT", 30.0),
            fetch_draft=_env_bool("FETCH_DRAFT", True),
            supabase_url=_env("SUPABASE_URL"),
            supabase_key=_env("SUPABASE_ANON_KEY"),
            healthcheck_url=_env("HEALTHCHECK_URL"),
        )
