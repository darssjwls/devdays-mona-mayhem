import type { APIRoute } from 'astro';

type Contribution = {
	date: string;
	count: number;
	level: number;
};

const GITHUB_USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;
const CACHE_CONTROL = 'public, max-age=300';
const DAYS_IN_WINDOW = 52 * 7;

function jsonResponse(body: unknown, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Cache-Control': CACHE_CONTROL,
			'Content-Type': 'application/json',
		},
	});
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeCalendar(payload: unknown): Contribution[] | null {
	if (
		!isRecord(payload) ||
		!isDate(payload.to) ||
		!Array.isArray(payload.weeks) ||
		payload.weeks.length < 52
	) {
		return null;
	}

	const allContributions: Contribution[] = [];

	for (const week of payload.weeks) {
		if (!isRecord(week) || !isDate(week.first_day) || !Array.isArray(week.contribution_days)) {
			return null;
		}

		const weekStart = new Date(`${week.first_day}T00:00:00.000Z`);
		if (weekStart.getUTCDay() !== 0 || week.contribution_days.length !== 7) {
			return null;
		}

		for (const [weekday, day] of week.contribution_days.entries()) {
			if (
				!isRecord(day) ||
				typeof day.count !== 'number' ||
				!Number.isInteger(day.count) ||
				day.count < 0 ||
				typeof day.level !== 'number' ||
				!Number.isInteger(day.level) ||
				day.level < 0 ||
				day.level > 4
			) {
				return null;
			}

			const date = new Date(weekStart);
			date.setUTCDate(date.getUTCDate() + weekday);
			allContributions.push({
				date: date.toISOString().slice(0, 10),
				count: day.count,
				level: day.level,
			});
		}
	}

	const throughEndDate = allContributions.filter((contribution) => contribution.date <= payload.to);
	const contributions = throughEndDate.slice(-DAYS_IN_WINDOW);

	if (contributions.length !== DAYS_IN_WINDOW) {
		return null;
	}

	return contributions;
}

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
	const username = params.username;
	if (typeof username !== 'string' || !GITHUB_USERNAME_PATTERN.test(username)) {
		return jsonResponse({ error: 'Invalid GitHub username' }, 400);
	}

	let upstreamResponse: Response;
	try {
		upstreamResponse = await fetch(`https://github.com/${username}.contribs`);
	} catch {
		return jsonResponse({ error: 'Unable to reach GitHub contribution service' }, 502);
	}

	if (upstreamResponse.status === 404) {
		return jsonResponse({ error: 'GitHub user not found' }, 404);
	}

	if (!upstreamResponse.ok) {
		return jsonResponse({ error: 'GitHub contribution service returned an error' }, 502);
	}

	let payload: unknown;
	try {
		payload = await upstreamResponse.json();
	} catch {
		return jsonResponse({ error: 'GitHub returned invalid contribution data' }, 502);
	}

	try {
		const contributions = normalizeCalendar(payload);
		if (!contributions) {
			return jsonResponse({ error: 'GitHub returned invalid contribution data' }, 502);
		}

		const total = contributions.reduce((sum, contribution) => sum + contribution.count, 0);
		return jsonResponse({ username, total, contributions }, 200);
	} catch {
		return jsonResponse({ error: 'Internal error while processing contribution data' }, 500);
	}
};
