"""HTTP client shared by all sources.

- Retries transient failures (connection errors, 429, 5xx) with exponential
  backoff, honouring Retry-After.
- Throttles to one request per `interval` seconds to stay polite.
- Detects CDN "Access Denied" pages so a block is reported as a block.
- Optionally archives every raw response (gzipped) for auditing.
"""

from __future__ import annotations

import gzip
import json
import logging
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

log = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0 Safari/537.36"
)


class SourceError(Exception):
    """A source couldn't be read. `kind` is blocked | http | timeout | network | invalid-json."""

    def __init__(self, kind: str, url: str, message: str, status: int | None = None):
        super().__init__(f"[{kind}] {message} ({url})")
        self.kind = kind
        self.url = url
        self.status = status


@dataclass
class Response:
    data: Any
    status: int
    bytes: int
    ms: int


class HttpClient:
    def __init__(self, interval: float = 1.0, timeout: float = 30.0, raw_dir: Path | None = None):
        self.interval = interval
        self.timeout = timeout
        self.raw_dir = raw_dir
        self._last = 0.0
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})
        retry = Retry(
            total=3,
            backoff_factor=1.0,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET",),
            respect_retry_after_header=True,
            raise_on_status=False,
        )
        self.session.mount("https://", HTTPAdapter(max_retries=retry))

    def get_json(self, url: str, headers: dict[str, str] | None = None, archive_as: str | None = None) -> Response:
        wait = self._last + self.interval - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        self._last = time.monotonic()

        started = time.monotonic()
        try:
            res = self.session.get(url, headers=headers, timeout=self.timeout)
        except requests.Timeout as err:
            raise SourceError("timeout", url, f"no response after {self.timeout}s") from err
        except requests.RequestException as err:
            raise SourceError("network", url, str(err)) from err
        ms = int((time.monotonic() - started) * 1000)

        if not res.ok:
            blocked = res.status_code == 403 and "Access Denied" in res.text
            raise SourceError(
                "blocked" if blocked else "http",
                url,
                "CDN returned Access Denied (edge block)" if blocked else f"HTTP {res.status_code}",
                res.status_code,
            )
        try:
            data = res.json()
        except ValueError as err:
            raise SourceError("invalid-json", url, f"expected JSON, got {res.text[:60]!r}", res.status_code) from err

        if self.raw_dir and archive_as:
            self._archive(archive_as, data)
        log.debug("GET %s %s %dB %dms", url, res.status_code, len(res.content), ms)
        return Response(data=data, status=res.status_code, bytes=len(res.content), ms=ms)

    def _archive(self, name: str, data: Any) -> None:
        assert self.raw_dir is not None
        self.raw_dir.mkdir(parents=True, exist_ok=True)
        safe = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
        with gzip.open(self.raw_dir / f"{safe}.json.gz", "wt", encoding="utf-8") as fh:
            json.dump(data, fh)
