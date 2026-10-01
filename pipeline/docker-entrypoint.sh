#!/bin/sh
# cron (default): optional run at startup, then run on CRON_FULL / CRON_INJURIES.
# run | probe | status: one-off commands, e.g. `docker compose run --rm pipeline run --only players`.
set -eu

case "${1:-cron}" in
  cron)
    if [ "$RUN_ON_START" = "true" ]; then
      python -m backboard_pipeline run || echo "startup run failed (exit $?); continuing to scheduler"
    fi
    crontab=/tmp/backboard.crontab
    echo "$CRON_FULL python -m backboard_pipeline run" > "$crontab"
    if [ -n "${CRON_INJURIES:-}" ]; then
      echo "$CRON_INJURIES python -m backboard_pipeline run --only injuries" >> "$crontab"
    fi
    echo "schedule (TZ=${TZ:-UTC}):"
    cat "$crontab"
    exec supercronic -passthrough-logs "$crontab"
    ;;
  run | probe | status)
    exec python -m backboard_pipeline "$@"
    ;;
  *)
    exec "$@"
    ;;
esac
