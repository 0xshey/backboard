import type { z } from "zod";
import { fetchJson, SourceError } from "./http";

export type ProbeCase = {
	/** Dataset this endpoint feeds, e.g. "schedule". */
	name: string;
	url: string;
	schema: z.ZodType;
	timeoutMs?: number;
	headers?: Record<string, string>;
};

export type ProbeResult = {
	name: string;
	url: string;
	ok: boolean;
	status: number | null;
	ms: number | null;
	bytes: number | null;
	error: string | null;
	/** First few schema issues when the payload doesn't match raw.ts. */
	issues: string[];
};

export type SourceProbeReport = {
	source: string;
	ok: boolean;
	checkedAt: string;
	results: ProbeResult[];
};

/** Fetch each endpoint once (no retries) and validate it against its raw schema. */
export async function runProbe(source: string, cases: ProbeCase[]): Promise<SourceProbeReport> {
	const results: ProbeResult[] = [];
	for (const c of cases) {
		try {
			const res = await fetchJson(c.url, { retries: 0, timeoutMs: c.timeoutMs, headers: c.headers });
			const parsed = c.schema.safeParse(res.data);
			const issues = parsed.success
				? []
				: parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
			results.push({
				name: c.name,
				url: c.url,
				ok: parsed.success,
				status: res.status,
				ms: res.ms,
				bytes: res.bytes,
				error: parsed.success ? null : "schema mismatch",
				issues,
			});
		} catch (err) {
			results.push({
				name: c.name,
				url: c.url,
				ok: false,
				status: err instanceof SourceError ? (err.status ?? null) : null,
				ms: null,
				bytes: null,
				error: err instanceof SourceError ? `${err.kind}: ${err.message}` : String(err),
				issues: [],
			});
		}
	}
	return {
		source,
		ok: results.every((r) => r.ok),
		checkedAt: new Date().toISOString(),
		results,
	};
}
