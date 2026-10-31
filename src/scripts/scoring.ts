import type { ContributionDay } from './battle';

export type PlayerStats = {
	totalContributions: number;
	longestStreak: number;
	currentStreak: number;
	peakDailyContributions: number;
	peakDay: string;
	consistencyScore: number;
};

type NumericCategoryKey =
	| 'totalContributions'
	| 'longestStreak'
	| 'currentStreak'
	| 'peakDailyContributions'
	| 'consistencyScore';

export type ScoreCategory = {
	key: NumericCategoryKey;
	playerOneValue: number;
	playerTwoValue: number;
	outcome: 'player1' | 'player2' | 'tie';
	playerOnePoints: number;
	playerTwoPoints: number;
};

export type BattleScore = {
	categories: ScoreCategory[];
	playerOneScore: number;
	playerTwoScore: number;
	winner: 'player1' | 'player2' | 'tie';
};

const CATEGORY_KEYS: NumericCategoryKey[] = [
	'totalContributions',
	'longestStreak',
	'currentStreak',
	'peakDailyContributions',
	'consistencyScore',
];

export function calculatePlayerStats(contributions: ContributionDay[]): PlayerStats {
	if (contributions.length === 0) {
		throw new Error('Cannot calculate player stats without contribution days.');
	}

	let totalContributions = 0;
	let activeDays = 0;
	let longestStreak = 0;
	let currentStreak = 0;
	let runningStreak = 0;
	let peakDailyContributions = -1;
	let peakDay = contributions[0].date;

	for (const contribution of contributions) {
		totalContributions += contribution.count;

		if (contribution.count > 0) {
			activeDays += 1;
			runningStreak += 1;
			longestStreak = Math.max(longestStreak, runningStreak);
		} else {
			runningStreak = 0;
		}

		if (contribution.count > peakDailyContributions) {
			peakDailyContributions = contribution.count;
			peakDay = contribution.date;
		}
	}

	for (let index = contributions.length - 1; index >= 0 && contributions[index].count > 0; index -= 1) {
		currentStreak += 1;
	}

	return {
		totalContributions,
		longestStreak,
		currentStreak,
		peakDailyContributions,
		peakDay,
		consistencyScore: Math.round((activeDays / contributions.length) * 100),
	};
}

export function scoreBattle(playerOne: PlayerStats, playerTwo: PlayerStats): BattleScore {
	let playerOneScore = 0;
	let playerTwoScore = 0;
	const categories = CATEGORY_KEYS.map((key) => {
		const playerOneValue = playerOne[key];
		const playerTwoValue = playerTwo[key];
		const outcome =
			playerOneValue === playerTwoValue
				? 'tie'
				: playerOneValue > playerTwoValue
					? 'player1'
					: 'player2';
		const playerOnePoints = outcome === 'tie' ? 0.5 : outcome === 'player1' ? 1 : 0;
		const playerTwoPoints = outcome === 'tie' ? 0.5 : outcome === 'player2' ? 1 : 0;

		playerOneScore += playerOnePoints;
		playerTwoScore += playerTwoPoints;

		return { key, playerOneValue, playerTwoValue, outcome, playerOnePoints, playerTwoPoints };
	});

	return {
		categories,
		playerOneScore,
		playerTwoScore,
		winner:
			playerOneScore === playerTwoScore
				? 'tie'
				: playerOneScore > playerTwoScore
					? 'player1'
					: 'player2',
	};
}
