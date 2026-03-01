/**
 * Timezone logic tests for player-weekly-performance.tsx
 *
 * Mirrors the pure date utility functions from the component so they can be
 * tested in isolation without React or Next.js.
 *
 * Run with:  node scripts/test-weekly-tz.mjs
 */

// ─── Functions under test (copied verbatim from the component) ────────────────

function utcToEasternDate(utcDatetime) {
	return new Date(utcDatetime).toLocaleDateString("en-CA", {
		timeZone: "America/New_York",
	});
}

function easternDateStringToDisplay(dateStr) {
	const [y, m, d] = dateStr.split("-").map(Number);
	return new Date(y, m - 1, d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function formatDateRange(start, end) {
	if (!start || !end) return "";
	return `${easternDateStringToDisplay(start)} – ${easternDateStringToDisplay(end)}`;
}

function isGameInWeek(utcDatetime, start_date, end_date) {
	const gameDate = utcToEasternDate(utcDatetime);
	return gameDate >= start_date && gameDate <= end_date;
}

// ─── Test harness ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
	if (actual === expected) {
		console.log(`  ✓  ${description}`);
		passed++;
	} else {
		console.error(`  ✗  ${description}`);
		console.error(`       expected: ${JSON.stringify(expected)}`);
		console.error(`       actual:   ${JSON.stringify(actual)}`);
		failed++;
	}
}

// ─── utcToEasternDate ─────────────────────────────────────────────────────────
console.log("\nutcToEasternDate — UTC timestamps → Eastern calendar date");

// Core case: Sunday night 10 PM ET = Monday 3 AM UTC.
// Without timezone conversion this would land on Monday (wrong week).
assert(
	"Sunday 22:00 ET (Mon 03:00 UTC) → Sunday Eastern date",
	utcToEasternDate("2026-03-02T03:00:00Z"), // Mon 3 AM UTC = Sun 10 PM ET
	"2026-03-01",
);

// Regular daytime game — no ambiguity expected.
assert(
	"Monday 19:30 ET (Mon 00:30 UTC next day) → Monday Eastern date",
	utcToEasternDate("2026-03-03T00:30:00Z"), // Tue 00:30 UTC = Mon 19:30 ET
	"2026-03-02",
);

// Exactly midnight UTC = 7 PM ET previous day
assert(
	"Midnight UTC (19:00 ET previous day) → correct Eastern date",
	utcToEasternDate("2026-03-04T00:00:00Z"),
	"2026-03-03",
);

// ─── easternDateStringToDisplay ───────────────────────────────────────────────
console.log("\neasternDateStringToDisplay — Eastern date string → display label");

// The key bug this fixes: new Date("2025-10-27") is UTC midnight → ET shows Oct 26.
// Our fix parses the parts directly to avoid this.
assert(
	"2025-10-27 displays as Oct 27 (not Oct 26 via UTC midnight)",
	easternDateStringToDisplay("2025-10-27"),
	"Oct 27",
);

assert(
	"2026-01-06 displays as Jan 6",
	easternDateStringToDisplay("2026-01-06"),
	"Jan 6",
);

assert(
	"2026-03-01 displays as Mar 1",
	easternDateStringToDisplay("2026-03-01"),
	"Mar 1",
);

// ─── formatDateRange ──────────────────────────────────────────────────────────
console.log("\nformatDateRange — week boundary display");

assert(
	"Week 20 range displays correctly",
	formatDateRange("2026-02-23", "2026-03-01"),
	"Feb 23 – Mar 1",
);

// ─── isGameInWeek — the critical matching logic ───────────────────────────────
console.log("\nisGameInWeek — game-to-week assignment");

// Sunday night game: 10 PM ET Sunday = 3 AM UTC Monday.
// Must land in the week ending Sunday, NOT the week starting Monday.
assert(
	"Sunday 22:00 ET game falls in week ending that Sunday",
	isGameInWeek("2026-03-02T03:00:00Z", "2026-02-23", "2026-03-01"),
	true,
);

assert(
	"Sunday 22:00 ET game does NOT fall in the following week",
	isGameInWeek("2026-03-02T03:00:00Z", "2026-03-02", "2026-03-08"),
	false,
);

// Monday game at 7:30 PM ET = 00:30 UTC Tuesday — should be in the new week.
assert(
	"Monday 19:30 ET game falls in week starting that Monday",
	isGameInWeek("2026-03-03T00:30:00Z", "2026-03-02", "2026-03-08"),
	true,
);

assert(
	"Monday 19:30 ET game does NOT fall in the previous week",
	isGameInWeek("2026-03-03T00:30:00Z", "2026-02-23", "2026-03-01"),
	false,
);

// Mid-week game — no ambiguity, should always be correct.
assert(
	"Wednesday midday game falls correctly within its week",
	isGameInWeek("2026-02-25T20:00:00Z", "2026-02-23", "2026-03-01"),
	true,
);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
