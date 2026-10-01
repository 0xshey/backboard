/**
 * Shared HTTP helper for source tools: browser UA, timeout, retry with backoff,
 * a global ~1 req/s throttle, and detection of CDN "Access Denied" HTML pages.
 */

export type SourceErrorKind = "blocked" | "http" | "timeout" | "network" | "invalid-json";

export class SourceError extends Error {
	constructor(
		public kind: SourceErrorKind,
		public url: string,
		message: string,
		public status?: number,
	) {
		super(`[${kind}] ${message} (${url})`);
		this.name = "SourceError";
	}
}

const USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";

let minIntervalMs = 1000;
let lastRequestAt = 0;

export function setThrottle(ms: number) {
	minIntervalMs = ms;
}

async function throttle() {
	const wait = lastRequestAt + minIntervalMs - Date.now();
	if (wait > 0) await new Promise((r) => setTimeout(r, wait));
	lastRequestAt = Date.now();
}

export type FetchResult = {
	data: unknown;
	status: number;
	bytes: number;
	ms: number;
};

export type FetchOptions = {
	timeoutMs?: number;
	retries?: number;
	headers?: Record<string, string>;
};

async function fetchOnce(url: string, opts: FetchOptions): Promise<FetchResult> {
	await throttle();
	const started = Date.now();
	let res: Response;
	try {
		res = await fetch(url, {
			headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...opts.headers },
			signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000),
		});
	} catch (err) {
		const name = (err as Error).name;
		if (name === "TimeoutError" || name === "AbortError") {
			throw new SourceError("timeout", url, `no response after ${opts.timeoutMs ?? 20_000}ms`);
		}
		throw new SourceError("network", url, (err as Error).message);
	}

	const text = await res.text();
	const ms = Date.now() - started;

	if (!res.ok) {
		const blocked = res.status === 403 && /Access Denied/i.test(text);
		throw new SourceError(
			blocked ? "blocked" : "http",
			url,
			blocked ? "CDN returned Access Denied (IP/edge block)" : `HTTP ${res.status}`,
			res.status,
		);
	}

	try {
		return { data: JSON.parse(text), status: res.status, bytes: text.length, ms };
	} catch {
		throw new SourceError("invalid-json", url, `expected JSON, got ${text.slice(0, 60)}…`, res.status);
	}
}

/** Fetch JSON with retries. Blocked/4xx responses are not retried. */
export async function fetchJson(url: string, opts: FetchOptions = {}): Promise<FetchResult> {
	const retries = opts.retries ?? 2;
	for (let attempt = 0; ; attempt++) {
		try {
			return await fetchOnce(url, opts);
		} catch (err) {
			const retryable =
				err instanceof SourceError &&
				(err.kind === "timeout" || err.kind === "network" || (err.status ?? 0) >= 500);
			if (!retryable || attempt >= retries) throw err;
			await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
		}
	}
}
