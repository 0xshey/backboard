# Backboard data pipeline

A Python job that refreshes the JSON the app serves. Each run does this:

```
lock → probe sources → fetch → validate → stage → publish (atomic) → manifest → clean up
```

Run it at any interval. It's safe to overlap (a lock file skips the second
run) and safe to kill (files are swapped atomically, so the app never reads a
half-written file). If a dataset fails validation, its **last good version
stays live**.

For running it on a NAS with Docker, see [docs/self-hosting.md](../docs/self-hosting.md).

## Datasets

| Dataset | Files | Primary source | Checks |
|---|---|---|---|
| `schedule` | `schedule-<season>.json`, `fantasy-weeks-<season>.json` | ESPN team schedules | ≥1000 games, unique ids, known teams, no team double-booked, season window, cross-check vs NBA.com (when reachable), Yahoo week rules |
| `players` | `players-<season>.json` | ESPN rosters + season stats, ESPN core (draft) | ≥400 players, unique ids, known teams, roster sizes, stat ranges, unique NBA ids |
| `injuries` | `injuries.json` | ESPN injuries | known statuses |

Every dataset is also guarded by a volume check. If it shrinks more than
`MAX_DROP_PCT` compared with the last published version, it isn't published.

## How data is checked and cleaned

1. **Transport.** Retries with exponential backoff on 429 and 5xx responses
   (honouring `Retry-After`), a ~1 request/second throttle, and CDN blocks
   reported as blocks.
2. **Raw schema.** Each source validates its API payloads with pydantic models
   (`sources/*.py`). Unknown fields are ignored and missing or changed fields
   fail loudly.
3. **Normalisation.** Team ids are mapped to NBA.com ids, text is Unicode-NFC
   with whitespace collapsed, times become ISO UTC, placeholder and
   non-regular-season games are dropped, rows are deduplicated and sorted
   deterministically.
4. **Canonical schema.** Strict output models (`models.py`, extra fields
   forbidden) with range checks. Invalid player rows are dropped with a
   warning; if more than 2% are invalid, the dataset fails.
5. **Data quality.** `quality.py` returns errors (block publishing) and
   warnings (recorded in the manifest).

## Output layout (`DATA_DIR`)

```
manifest.json          run status, per-source probe results, per-dataset records/issues/sha256
*.json                 live datasets the app reads
_history/<run>/        previous versions replaced by that run (last KEEP_HISTORY runs)
_raw/<run>/*.json.gz   raw API responses (kept KEEP_RAW_DAYS days)
player-id-overrides.json   optional, hand-maintained {"<espnId>": "<nbaId>"}
```

To roll back a dataset, copy the file you want from `_history/<run>/` back
into `DATA_DIR`.

## Running locally

```bash
cd pipeline
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
DATA_DIR=../data SEED_DIR=../src/data python -m backboard_pipeline run --dry-run
DATA_DIR=../data python -m backboard_pipeline status
pytest
```

| Command | What it does |
|---|---|
| `run [--only schedule,players,injuries] [--dry-run] [--force]` | Full pipeline. `--force` publishes despite data-quality errors, but never despite fetch or schema errors. |
| `probe` | Checks that each source is reachable and matches its schema. |
| `status [--max-age-hours N]` | Summarises the manifest. With `--max-age-hours`, exits 1 if any dataset is older than N hours. |

Exit codes: `0` all ok · `1` a dataset failed (last good kept) · `2` configuration error · `75` another run in progress.

## Configuration (environment variables)

| Variable | Default | |
|---|---|---|
| `DATA_DIR` | `data` | Where published files live |
| `SEED_DIR` | – | Copied into an empty `DATA_DIR` on first run |
| `SEASON` | `2027` | ESPN season id, i.e. the year the season ends |
| `WEEKS_AUTO` | `true` | `false` keeps a hand-edited fantasy-weeks file |
| `MAX_DROP_PCT` | `20` | Volume guard |
| `MAX_DISAGREEMENT_PCT` | `2` | Schedule cross-check tolerance |
| `KEEP_HISTORY` / `KEEP_RAW_DAYS` | `14` / `7` | Retention |
| `FETCH_DRAFT` | `true` | Look up draft info for new rookies |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | – | Optional: name-match ESPN players to NBA.com ids for headshots |
| `HEALTHCHECK_URL` | – | Optional [healthchecks.io](https://healthchecks.io)-style ping URL (`/start`, success, `/fail`) |
| `REQUEST_INTERVAL` / `REQUEST_TIMEOUT` | `1` / `30` | Seconds |
| `LOG_LEVEL` | `INFO` | |

## Notes on the sources

- **ESPN (`site.web.api.espn.com`)** is free, needs no key and is undocumented.
  The sibling host `site.api.espn.com` is edge-blocked.
- **NBA.com CDN** blocks Python HTTP clients from many networks. It's only used
  to cross-check the schedule and is skipped with a warning when blocked. We
  deliberately don't use browser-impersonation tricks to get around it.
- **Yahoo** doesn't publish fantasy weeks without an OAuth app, so `weeks.py`
  derives them with Yahoo's rules. These matched Yahoo's real 2025-26 weeks
  exactly.
- The TypeScript tools in `scripts/sources.ts` are the dev-time equivalent and
  produce identical output.
