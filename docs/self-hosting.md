# Self-hosting on a NAS (Docker)

Two containers share one data volume:

```
┌──────────────┐  writes JSON   ┌──────────────┐  reads JSON   ┌──────────────┐
│   pipeline   │ ─────────────▶ │  /data volume │ ◀──────────── │     app      │
│ (cron, py)   │                └──────────────┘   (read-only)  │ (Next.js)    │
└──────────────┘                                                └──────────────┘
```

- **app** serves the site on port 3000. It reads data at request time, so new
  data appears without a rebuild. The Schedule page caches for up to an hour.
- **pipeline** runs once at startup, then on a schedule. It fetches,
  validates and publishes data. See [pipeline/README.md](../pipeline/README.md).

## 1. Quick start

On the NAS, from a checkout of this repo:

```bash
docker compose up -d --build
```

Open `http://<nas-ip>:3000`, then check that the pipeline ran:

```bash
docker compose logs -f pipeline
```

```bash
docker compose exec pipeline python -m backboard_pipeline status
```

Both images build for `amd64` and `arm64`.

## 2. Schedule

The schedule is set by environment variables on the `pipeline` service in
`docker-compose.yml`, using standard cron syntax in the `TZ` timezone:

| Variable | Default | Meaning |
|---|---|---|
| `CRON_FULL` | `15 6 * * *` | Schedule, players and injuries, daily at 06:15 |
| `CRON_INJURIES` | `5 * * * *` | Injuries only, hourly. Leave blank to disable |
| `RUN_ON_START` | `true` | Run once whenever the container starts |
| `TZ` | `America/New_York` | Timezone for the cron expressions |

Examples:
- Every 6 hours: `CRON_FULL: "0 */6 * * *"`
- Game nights only, injuries every 15 minutes from 17:00 to 23:00:
  `CRON_INJURIES: "*/15 17-23 * * *"`

After changing these, run `docker compose up -d` to apply them.

Scheduling uses [supercronic](https://github.com/aptible/supercronic), a cron
built for containers that logs to stdout. If a job is still running when its
next slot arrives, that slot is skipped. The pipeline's own lock also stops
the hourly and daily jobs from overlapping.

### Alternative: let the NAS schedule it

If you prefer your NAS's own scheduler, remove the `CRON_*` settings. Then set
`command: ["run"]` and `restart: "no"` on the pipeline service, and schedule
this command:

```bash
docker compose -f /path/to/backboard/docker-compose.yml run --rm pipeline run
```

- **Synology DSM:** Control Panel → Task Scheduler → Create → Scheduled Task →
  User-defined script. Run it as `root`, or as a user in the `docker` group.
- **Unraid:** User Scripts plugin, custom cron schedule.
- **TrueNAS / plain Linux:** a crontab entry, e.g.
  `15 6 * * * docker compose -f ... run --rm pipeline run`.

## 3. Keeping data in a NAS folder (bind mount)

The default is a Docker named volume. To keep the data somewhere you can
browse and back up, replace `backboard-data:/data` in **both** services with a
path:

```yaml
    volumes:
      - /volume1/docker/backboard/data:/data      # pipeline
      - /volume1/docker/backboard/data:/data:ro   # app
```

The pipeline runs as uid 1000, so the folder must be writable by it. Either:

```bash
sudo chown -R 1000:1000 /volume1/docker/backboard/data
```

or run the pipeline as your NAS user by adding `user: "1026:100"` (your
uid:gid) to the pipeline service. The app only needs read access.

## 4. Optional settings

| Variable (pipeline) | Why you'd set it |
|---|---|
| `HEALTHCHECK_URL` | Get alerted when a run fails or stops happening. Create a free check at healthchecks.io and paste its ping URL |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Match new players to NBA.com ids for consistent headshots. Put them in a `.env` file next to `docker-compose.yml`; Compose reads it automatically. Without these, new players use ESPN headshots |
| `SEASON` + app's `DATA_SEASON` | Roll over to a new season, e.g. `2028` and `2027-28`. Change both, then `docker compose up -d` |
| `KEEP_HISTORY`, `KEEP_RAW_DAYS` | Disk usage. The defaults use well under 100 MB |

Container health: `docker ps` shows the pipeline as `unhealthy` if any dataset
is more than 36 hours old.

## 5. Day-to-day operations

To run the pipeline now instead of waiting for the schedule:

```bash
docker compose exec pipeline python -m backboard_pipeline run
```

To refresh a single dataset:

```bash
docker compose exec pipeline python -m backboard_pipeline run --only players
```

To check that each source is reachable and still matches its schema:

```bash
docker compose exec pipeline python -m backboard_pipeline probe
```

To roll back a dataset, list the saved versions:

```bash
docker compose exec pipeline ls /data/_history
```

Then copy the version you want back into place:

```bash
docker compose exec pipeline cp /data/_history/<run>/players-2026-27.json /data/
```

To update after pulling new code:

```bash
docker compose up -d --build
```

## 6. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `status` shows a dataset as `stale` | Its last run failed validation; the previous good data is still being served. The manifest's `lastIssues` or the logs say why. Re-run with `--force` only if the data is actually fine |
| `nba-cdn DOWN` in `status` | NBA.com blocks some networks and clients. Only the schedule cross-check is skipped |
| `espn DOWN` | ESPN or DNS is unreachable from the NAS. Nothing is published and the site keeps serving the last data |
| Exit code 75 in logs | Two runs overlapped; the second one skipped. Harmless |
| Permission denied writing `/data` | See the bind mount section |
| Site shows old data after a run | The Schedule page caches for up to an hour; rankings update on the next request |
