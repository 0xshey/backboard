"""ESPN → NBA.com player id matching (NBA ids drive headshot URLs).

Resolution order, first hit wins:
1. DATA_DIR/player-id-overrides.json  {"<espnId>": "<nbaId>"}, hand-maintained
2. The previous published players file (keeps matches stable between runs)
3. Name match against the Supabase `player` table, if SUPABASE_* is set
"""

from __future__ import annotations

import logging
import re
import unicodedata

from .http import HttpClient

log = logging.getLogger(__name__)


def normalize_name(name: str) -> str:
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    ascii_name = re.sub(r"\b(jr|sr|ii|iii|iv)\b", "", ascii_name)
    return re.sub(r"[^a-z]", "", ascii_name)


def supabase_name_index(http: HttpClient, url: str, key: str) -> dict[str, str]:
    index: dict[str, str] = {}
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    start = 0
    while True:
        res = http.get_json(
            f"{url.rstrip('/')}/rest/v1/player?select=id,first_name,last_name",
            headers={**headers, "Range": f"{start}-{start + 999}"},
        )
        rows = res.data
        for r in rows:
            index.setdefault(normalize_name(f"{r['first_name']}{r['last_name']}"), str(r["id"]))
        if len(rows) < 1000:
            return index
        start += 1000


def resolve_nba_ids(
    bios: list[dict],
    overrides: dict[str, str],
    previous: dict[str, str],
    name_index: dict[str, str],
) -> dict[str, int]:
    """Set bio["nbaId"] in place. Returns counts per resolution method."""
    counts = {"override": 0, "previous": 0, "name": 0, "unmatched": 0}
    for bio in bios:
        espn_id = bio["espnId"]
        if espn_id in overrides:
            bio["nbaId"], method = overrides[espn_id], "override"
        elif espn_id in previous:
            bio["nbaId"], method = previous[espn_id], "previous"
        elif (nba := name_index.get(normalize_name(bio["name"]))):
            bio["nbaId"], method = nba, "name"
        else:
            bio["nbaId"], method = None, "unmatched"
        counts[method] += 1

    # Two players can't share an NBA id; drop the weaker (name-based) duplicates.
    seen: dict[str, dict] = {}
    for bio in bios:
        nba = bio["nbaId"]
        if nba and nba in seen:
            log.warning("NBA id %s matched to both %s and %s; clearing the second", nba, seen[nba]["name"], bio["name"])
            bio["nbaId"] = None
        elif nba:
            seen[nba] = bio
    return counts
