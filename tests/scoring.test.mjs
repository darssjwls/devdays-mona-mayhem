import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculatePlayerStats, scoreBattle } from '../src/scripts/scoring.ts';

function daysWithCounts(overrides = {}) {
	const start = new Date(Date.UTC(2025, 10, 2));
	return Array.from({ length: 364 }, (_, index) => {
		const date = new Date(start);
		date.setUTCDate(date.getUTCDate() + index);
		const count = overrides[index] ?? 0;
		return {
			date: date.toISOString().slice(0, 10),
			count,
			level: count === 0 ? 0 : 1,
		};
	});
}

test('calculates past-year totals, streaks, peak day, and active-day consistency', () => {
	const stats = calculatePlayerStats(daysWithCounts({
		0: 2,
		1: 1,
		3: 4,
		4: 3,
	}));

	assert.deepEqual(stats, {
		totalContributions: 10,
		longestStreak: 2,
		currentStreak: 0,
		peakDailyContributions: 4,
		peakDay: '2025-11-05',
		consistencyScore: 1,
	});
});

test('awards equal category points, splitting ties, and declares the higher total winner', () => {
	const result = scoreBattle(
		{
			totalContributions: 10,
			longestStreak: 3,
			currentStreak: 2,
			peakDailyContributions: 8,
			consistencyScore: 50,
		},
		{
			totalContributions: 9,
			longestStreak: 3,
			currentStreak: 1,
			peakDailyContributions: 8,
			consistencyScore: 50,
		},
	);

	assert.equal(result.playerOneScore, 3.5);
	assert.equal(result.playerTwoScore, 1.5);
	assert.equal(result.winner, 'player1');
	assert.deepEqual(
		result.categories.map(({ outcome }) => outcome),
		['player1', 'tie', 'player1', 'tie', 'tie'],
	);
});

test('declares a tie when every category and the overall score are tied', () => {
	const stats = {
		totalContributions: 0,
		longestStreak: 0,
		currentStreak: 0,
		peakDailyContributions: 0,
		consistencyScore: 0,
	};

	const result = scoreBattle(stats, stats);

	assert.equal(result.playerOneScore, 2.5);
	assert.equal(result.playerTwoScore, 2.5);
	assert.equal(result.winner, 'tie');
});

test('counts a current streak through the last active date in the calendar', () => {
	const stats = calculatePlayerStats(daysWithCounts({
		360: 1,
		361: 2,
		362: 1,
		363: 3,
	}));

	assert.equal(stats.currentStreak, 4);
});
