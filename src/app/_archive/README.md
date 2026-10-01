# Archive

Pages retired while Backboard runs on static data. Folders prefixed with `_` are
ignored by the Next.js router, so this code still type-checks but is not served.
Their components live in `src/components/_archive/`.

| Folder | What it was | Supabase tables |
|---|---|---|
| `daily-rankings/` | `/rankings?date=` — daily fantasy rankings with game chips | `game`, `game_player`, `player`, `player_season_averages`, `team`, `standings` |
| `consistency/` | `/consistency` — player consistency grid + expandable gamelog | `player_consistency`, `game_player` |
| `player/` | `/player/[playerId]` — profile, season card, performance chart, weekly performance | `player`, `team`, `player_season_averages`, `game_player`, `game_week_fantasy` |
| `demo/` | `/demo` — game chip playground (mock data) | — |
| `api-players-search/` | `GET /api/players/search?q=` — player name search | `player` |

## Reviving a page

1. `git mv src/app/_archive/<folder> "src/app/(app)/<route>"` (the player page goes
   back to `(app)/player/[playerId]`, the API route to `api/players/search`).
2. `git mv` any components it needs from `src/components/_archive/` back to
   `src/components/` and update the `@/components/_archive/...` imports.
3. The consistency page also needs `GameCacheProvider` re-added to `src/app/layout.tsx`.
4. Add its link back to `TOOL_LINKS` in `src/lib/navigation-links.ts`.
