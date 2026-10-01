"""Team id mapping. teams.json (NBA.com ids) is the reference every source maps onto."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TeamIndex:
    by_tricode: dict[str, str]
    by_id: dict[str, str]

    @classmethod
    def from_rows(cls, rows: list[dict]) -> "TeamIndex":
        if len(rows) != 30:
            raise ValueError(f"teams.json should list 30 teams, found {len(rows)}")
        return cls(
            by_tricode={r["tricode"]: str(r["id"]) for r in rows},
            by_id={str(r["id"]): r["tricode"] for r in rows},
        )

    def id_for(self, tricode: str) -> str:
        try:
            return self.by_tricode[tricode]
        except KeyError:
            raise ValueError(f"unknown team tricode {tricode!r}") from None
