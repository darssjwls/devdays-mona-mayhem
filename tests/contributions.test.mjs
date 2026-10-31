import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { GET, prerender } from '../src/pages/api/contributions/[username].ts';

const originalFetch = globalThis.fetch;
const cacheControl = 'public, max-age=300';

afterEach(() => {
	globalThis.fetch = originalFetch;
});

function createCalendar() {
	const from = new Date(Date.UTC(2025, 9, 26));
	const weeks = Array.from({ length: 53 }, (_, weekIndex) => {
		const weekStart = new Date(from);
		weekStart.setUTCDate(from.getUTCDate() + weekIndex * 7);

		return {
			index: weekIndex,
			first_day: weekStart.toISOString().slice(0, 10),
			contribution_days: Array.from({ length: 7 }, (_, weekday) => {
				const dayIndex = weekIndex * 7 + weekday;
				return {
					weekday,
					count: dayIndex < 7 ? 8 : 1,
					level: dayIndex < 7 ? 3 : 1,
				};
			}),
		};
	});

	return {
		schema: 'v2',
		from: '2025-10-26',
		to: '2026-10-31',
		range_days: 371,
		total_contributions: 420,
		weeks,
	};
}

test('disables prerendering for per-username requests', () => {
	assert.equal(prerender, false);
});

test('returns 400 for an invalid username without making an upstream request', async () => {
	let fetchCalled = false;
	globalThis.fetch = async () => {
		fetchCalled = true;
		throw new Error('fetch should not be called');
	};

	const response = await GET({ params: { username: 'bad_name' } });

	assert.equal(response.status, 400);
	assert.equal(fetchCalled, false);
	assert.equal(response.headers.get('Cache-Control'), cacheControl);
	assert.match(response.headers.get('Content-Type'), /application\/json/);
});

test('returns the latest 364 daily contributions in normalized JSON', async () => {
	const upstream = createCalendar();
	globalThis.fetch = async (url) => {
		assert.equal(url, 'https://github.com/octocat.contribs');
		return Response.json(upstream);
	};

	const response = await GET({ params: { username: 'octocat' } });
	const body = await response.json();

	assert.equal(response.status, 200);
	assert.equal(response.headers.get('Cache-Control'), cacheControl);
	assert.equal(body.username, 'octocat');
	assert.equal(body.total, 364);
	assert.equal(body.contributions.length, 364);
	assert.deepEqual(body.contributions[0], {
		date: '2025-11-02',
		count: 1,
		level: 1,
	});
	assert.deepEqual(body.contributions.at(-1), {
		date: '2026-10-31',
		count: 1,
		level: 1,
	});
});

test('maps an upstream not-found response to 404', async () => {
	globalThis.fetch = async () => new Response(null, { status: 404 });

	const response = await GET({ params: { username: 'unknown-user' } });

	assert.equal(response.status, 404);
	assert.equal(response.headers.get('Cache-Control'), cacheControl);
});

test('maps upstream request failures to 502', async () => {
	globalThis.fetch = async () => {
		throw new Error('upstream unavailable');
	};

	const response = await GET({ params: { username: 'octocat' } });

	assert.equal(response.status, 502);
	assert.equal(response.headers.get('Cache-Control'), cacheControl);
});

test('maps malformed upstream contribution data to 502', async () => {
	globalThis.fetch = async () => Response.json({ weeks: [] });

	const response = await GET({ params: { username: 'octocat' } });

	assert.equal(response.status, 502);
	assert.equal(response.headers.get('Cache-Control'), cacheControl);
});
