# syntax=docker/dockerfile:1
# Backboard data pipeline. Build from the repo root:
#   docker build -f pipeline/Dockerfile -t backboard-pipeline .
FROM python:3.12-slim

# supercronic: cron for containers (logs to stdout, passes env through).
# Checksums from https://github.com/aptible/supercronic/releases/tag/v0.2.49
ARG TARGETARCH
ARG SUPERCRONIC_VERSION=v0.2.49
ARG SUPERCRONIC_SHA256_AMD64=a53ae236602c7338aba3fbaff40bda6300eae3b9fedb8261eb06cfe3724430c1
ARG SUPERCRONIC_SHA256_ARM64=02aa0cb229ba09050cba6638059dadb9eedc2276632ea43d6a57a2f8c1629dd5
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl tzdata; \
    arch="${TARGETARCH:-amd64}"; \
    case "$arch" in \
      amd64) sha="$SUPERCRONIC_SHA256_AMD64" ;; \
      arm64) sha="$SUPERCRONIC_SHA256_ARM64" ;; \
      *) echo "unsupported architecture: $arch" >&2; exit 1 ;; \
    esac; \
    curl -fsSLo /usr/local/bin/supercronic \
      "https://github.com/aptible/supercronic/releases/download/${SUPERCRONIC_VERSION}/supercronic-linux-${arch}"; \
    echo "${sha}  /usr/local/bin/supercronic" | sha256sum -c -; \
    chmod +x /usr/local/bin/supercronic; \
    apt-get purge -y curl; apt-get autoremove -y; rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY pipeline/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY pipeline/backboard_pipeline ./backboard_pipeline
COPY pipeline/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
# Seed data for an empty volume on first run.
COPY src/data ./seed-data

RUN chmod +x /usr/local/bin/docker-entrypoint \
    && useradd --uid 1000 --create-home pipeline \
    && mkdir -p /data && chown pipeline /data

ENV PYTHONUNBUFFERED=1 \
    DATA_DIR=/data \
    SEED_DIR=/app/seed-data \
    SEASON=2027 \
    CRON_FULL="15 6 * * *" \
    CRON_INJURIES="5 * * * *" \
    RUN_ON_START=true

USER pipeline
HEALTHCHECK --interval=30m --timeout=30s --start-period=15m \
    CMD python -m backboard_pipeline status --max-age-hours 36 >/dev/null || exit 1
ENTRYPOINT ["docker-entrypoint"]
CMD ["cron"]
