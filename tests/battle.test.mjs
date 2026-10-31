import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
	animateContributionGrid,
	bindSfxToggle,
	bindMatchupPresets,
	revealBattleCategories,
	runBattleCountdown,
	triggerBattleCelebration,
	updatePowerMeter,
	fetchBattle,
	renderContributionGrid,
	renderLoadingSkeleton,
} from '../src/scripts/battle.ts';

const originalDocument = globalThis.document;
const originalFetch = globalThis.fetch;

class FakeElement {
	dataset = {};
	attributes = {};
	children = [];
	style = {
		properties: {},
		setProperty(name, value) { this.properties[name] = value; },
	};
	classList = {
		values: new Set(),
		add(value) { this.values.add(value); },
		remove(value) { this.values.delete(value); },
		contains(value) { return this.values.has(value); },
	};

	setAttribute(name, value) {
		this.attributes[name] = value;
	}

	addEventListener(event, callback) {
		this.listeners ??= {};
		this.listeners[event] = callback;
	}

	replaceChildren(...children) {
		this.children = children;
	}
}

function installFakeDocument() {
	globalThis.document = {
		createElement: () => new FakeElement(),
	};
}

function createContributions() {
	const start = new Date(Date.UTC(2025, 10, 2));
	return Array.from({ length: 364 }, (_, index) => {
		const date = new Date(start);
		date.setUTCDate(date.getUTCDate() + index);
		return {
			date: date.toISOString().slice(0, 10),
			count: index % 5,
			level: index % 5,
		};
	});
}

afterEach(() => {
	globalThis.document = originalDocument;
	globalThis.fetch = originalFetch;
});

test('renders 364 contribution cells with levels and accessible date/count tooltips', () => {
	installFakeDocument();
	const container = new FakeElement();
	const contributions = createContributions();

	renderContributionGrid(container, contributions);

	assert.equal(container.children.length, 364);
	assert.equal(container.children[0].dataset.level, '0');
	assert.equal(container.children[1].dataset.level, '1');
	assert.equal(container.children[4].dataset.level, '4');
	assert.equal(container.children[1].title, `${contributions[1].date}: 1 contribution`);
	assert.equal(
		container.children[1].attributes['aria-label'],
		`${contributions[1].date}: 1 contribution`,
	);
});

test('renders a 52 by 7 loading skeleton', () => {
	installFakeDocument();
	const container = new FakeElement();

	renderLoadingSkeleton(container);

	assert.equal(container.children.length, 364);
	assert.ok(container.children.every((cell) => cell.className === 'calendar-skeleton-cell'));
});

test('fetches both contribution calendars in parallel', async () => {
	const calls = [];
	const contributions = createContributions();
	globalThis.fetch = async (url) => {
		calls.push(url);
		return Response.json({
			username: url.split('/').at(-1),
			total: contributions.reduce((sum, contribution) => sum + contribution.count, 0),
			contributions,
		});
	};

	const result = await fetchBattle('octocat', 'torvalds');

	assert.deepEqual(calls, [
		'/api/contributions/octocat',
		'/api/contributions/torvalds',
	]);
	assert.equal(result[0].username, 'octocat');
	assert.equal(result[1].username, 'torvalds');
});

test('reports an unknown username clearly', async () => {
	const contributions = createContributions();
	globalThis.fetch = async (url) => {
		if (url.endsWith('/missing-user')) {
			return new Response('{"error":"GitHub user not found"}', { status: 404 });
		}

		return Response.json({
			username: 'octocat',
			total: contributions.reduce((sum, contribution) => sum + contribution.count, 0),
			contributions,
		});
	};

	await assert.rejects(fetchBattle('octocat', 'missing-user'), /missing-user.*not found/i);
});

test('preset matchup buttons fill both usernames and immediately submit the battle', () => {
	const playerOneInput = { value: '' };
	const playerTwoInput = { value: '' };
	let submissions = 0;
	let clicks = 0;
	const form = { requestSubmit: () => { submissions += 1; } };
	const buttons = [
		{
			dataset: { playerOne: 'torvalds', playerTwo: 'gaearon' },
			addEventListener(event, callback) { this.clickHandler = callback; },
		},
		{
			dataset: { playerOne: 'octocat', playerTwo: 'sindresorhus' },
			addEventListener(event, callback) { this.clickHandler = callback; },
		},
	];

	bindMatchupPresets(buttons, playerOneInput, playerTwoInput, form, () => { clicks += 1; });
	buttons[1].clickHandler();

	assert.equal(playerOneInput.value, 'octocat');
	assert.equal(playerTwoInput.value, 'sindresorhus');
	assert.equal(submissions, 1);
	assert.equal(clicks, 1);
});

test('mute toggle updates its visible label and silences or restores sound', () => {
	const button = new FakeElement();
	let muted = false;
	const audio = {
		isMuted: () => muted,
		toggleMuted: () => {
			muted = !muted;
			return muted;
		},
	};

	bindSfxToggle(button, audio);
	assert.equal(button.textContent, '🔊 SFX: ON');
	assert.equal(button.attributes['aria-pressed'], 'true');

	button.listeners.click();
	assert.equal(button.textContent, '🔇 SFX: OFF');
	assert.equal(button.attributes['aria-pressed'], 'false');

	button.listeners.click();
	assert.equal(button.textContent, '🔊 SFX: ON');
	assert.equal(button.attributes['aria-pressed'], 'true');
});

test('shows countdown stages in order with equal stage intervals', async () => {
	const visible = [];
	const intervals = [];

	await runBattleCountdown((stage) => visible.push(stage), async (milliseconds) => {
		intervals.push(milliseconds);
	});

	assert.deepEqual(visible, ['3...', '2...', '1...', 'FIGHT!']);
	assert.deepEqual(intervals, [500, 500, 500, 500]);
});

test('stages the 52-week grid one column at a time from left to right', () => {
	const grid = new FakeElement();
	grid.children = Array.from({ length: 364 }, () => new FakeElement());

	animateContributionGrid(grid);

	assert.equal(grid.dataset.revealing, 'true');
	assert.equal(grid.children[0].style.properties['--column-delay'], '0ms');
	assert.equal(grid.children[7].style.properties['--column-delay'], '24ms');
	assert.equal(grid.children[363].style.properties['--column-delay'], '1224ms');
});

test('reveals stat categories in order with 400ms between rows', async () => {
	const categories = ['total', 'streak', 'current', 'peak', 'consistency'];
	const revealed = [];
	const pauses = [];

	await revealBattleCategories(categories, (category) => revealed.push(category), async (milliseconds) => {
		pauses.push(milliseconds);
	});

	assert.deepEqual(revealed, categories);
	assert.deepEqual(pauses, [400, 400, 400, 400]);
});

test('updates power meter values cumulatively on the five-point scale', () => {
	const fill = new FakeElement();
	const value = new FakeElement();
	const meter = new FakeElement();

	updatePowerMeter(fill, value, meter, 2.5);

	assert.equal(fill.style.width, '50%');
	assert.equal(value.textContent, '2.5 / 5');
	assert.equal(meter.attributes['aria-valuenow'], '2.5');
});

test('celebrates a winner with a result animation, screen shake, and replaceable particles', () => {
	installFakeDocument();
	const banner = new FakeElement();
	const particles = new FakeElement();
	const body = new FakeElement();

	triggerBattleCelebration('player2', banner, particles, body);

	assert.equal(banner.dataset.outcome, 'player2');
	assert.ok(banner.classList.contains('winner-reveal'));
	assert.ok(body.classList.contains('battle-shake'));
	assert.equal(particles.children.length, 16);
	assert.ok(particles.children.every((particle) => particle.className === 'victory-particle'));
});
