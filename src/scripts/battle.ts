import { calculatePlayerStats, scoreBattle } from './scoring.ts';
import { arcadeAudio, type ArcadeAudio } from './arcade-audio.ts';

export type ContributionDay = {
	date: string;
	count: number;
	level: number;
};

export type ContributionResponse = {
	username: string;
	total: number;
	contributions: ContributionDay[];
};

const DAYS_IN_WINDOW = 52 * 7;
const CATEGORY_REVEAL_DELAY = 400;
const COUNTDOWN_STEPS = ['3...', '2...', '1...', 'FIGHT!'] as const;
const CELEBRATION_PARTICLES = [
	[0, -72], [30, -64], [55, -42], [72, -12], [66, 22], [42, 52], [12, 72], [-24, 66],
	[-54, 44], [-72, 10], [-62, -26], [-38, -54], [18, -38], [44, 8], [-12, 34], [-32, 4],
];

type Wait = (milliseconds: number) => Promise<void>;

function animationWait(milliseconds: number): Promise<void> {
	if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return Promise.resolve();
	}

	return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
}

export async function runBattleCountdown(
	update: (stage: string) => void,
	pause: Wait = animationWait,
	signal?: AbortSignal,
): Promise<void> {
	for (const stage of COUNTDOWN_STEPS) {
		if (signal?.aborted) return;
		update(stage);
		await pause(500);
	}
}

export function animateContributionGrid(container: HTMLElement): void {
	if (container.children.length !== DAYS_IN_WINDOW) {
		throw new Error(`Expected ${DAYS_IN_WINDOW} contribution cells.`);
	}

	container.dataset.revealing = 'true';
	for (const [index, cell] of Array.from(container.children).entries()) {
		(cell as HTMLElement).style.setProperty('--column-delay', `${Math.floor(index / 7) * 24}ms`);
	}
}

export async function revealBattleCategories<T>(
	categories: T[],
	reveal: (category: T, index: number) => void,
	pause: Wait = animationWait,
): Promise<void> {
	for (const [index, category] of categories.entries()) {
		reveal(category, index);
		if (index < categories.length - 1) {
			await pause(CATEGORY_REVEAL_DELAY);
		}
	}
}

export function updatePowerMeter(
	fill: HTMLElement,
	value: HTMLElement,
	meter: HTMLElement,
	score: number,
): void {
	const safeScore = Math.min(5, Math.max(0, score));
	fill.style.width = `${(safeScore / 5) * 100}%`;
	value.textContent = `${safeScore} / 5`;
	meter.setAttribute('aria-valuenow', String(safeScore));
}

export function triggerBattleCelebration(
	outcome: 'player1' | 'player2' | 'tie',
	banner: HTMLElement,
	particles: HTMLElement,
	body: HTMLElement,
): void {
	banner.classList.remove('winner-reveal');
	body.classList.remove('battle-shake');
	particles.replaceChildren();
	banner.dataset.outcome = outcome;

	const burst = CELEBRATION_PARTICLES.map(([x, y]) => {
		const particle = document.createElement('span');
		particle.className = 'victory-particle';
		particle.setAttribute('aria-hidden', 'true');
		particle.style.setProperty('--particle-x', `${x}px`);
		particle.style.setProperty('--particle-y', `${y}px`);
		return particle;
	});

	particles.replaceChildren(...burst);
	void banner.offsetWidth;
	void body.offsetWidth;
	banner.classList.add('winner-reveal');
	body.classList.add('battle-shake');
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const parsed = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isContributionResponse(value: unknown, requestedUsername: string): value is ContributionResponse {
	if (
		!isRecord(value) ||
		value.username !== requestedUsername ||
		typeof value.total !== 'number' ||
		!Number.isSafeInteger(value.total) ||
		value.total < 0 ||
		!Array.isArray(value.contributions) ||
		value.contributions.length !== DAYS_IN_WINDOW
	) {
		return false;
	}

	let total = 0;
	let previousDate: Date | null = null;

	for (const contribution of value.contributions) {
		if (
			!isRecord(contribution) ||
			!isValidDate(contribution.date) ||
			typeof contribution.count !== 'number' ||
			!Number.isSafeInteger(contribution.count) ||
			contribution.count < 0 ||
			typeof contribution.level !== 'number' ||
			!Number.isInteger(contribution.level) ||
			contribution.level < 0 ||
			contribution.level > 4
		) {
			return false;
		}

		const date = new Date(`${contribution.date}T00:00:00.000Z`);
		if (previousDate && date.getTime() - previousDate.getTime() !== 86_400_000) {
			return false;
		}
		previousDate = date;
		total += contribution.count;
	}

	return total === value.total;
}

async function fetchContributions(username: string): Promise<ContributionResponse> {
	let response: Response;
	try {
		response = await fetch(`/api/contributions/${encodeURIComponent(username)}`);
	} catch {
		throw new Error(`Couldn't reach the contribution service for ${username}.`);
	}

	let payload: unknown;
	try {
		payload = await response.json();
	} catch {
		throw new Error(`The contribution service returned invalid data for ${username}.`);
	}

	if (!response.ok) {
		if (response.status === 404) {
			throw new Error(`GitHub user "${username}" was not found. Check the username and try again.`);
		}

		const message =
			isRecord(payload) && typeof payload.error === 'string'
				? payload.error
				: `Could not load contributions for ${username}.`;
		throw new Error(message);
	}

	if (!isContributionResponse(payload, username)) {
		throw new Error(`The contribution service returned an invalid calendar for ${username}.`);
	}

	return payload;
}

export function fetchBattle(
	playerOne: string,
	playerTwo: string,
): Promise<[ContributionResponse, ContributionResponse]> {
	return Promise.all([fetchContributions(playerOne), fetchContributions(playerTwo)]);
}

export function bindMatchupPresets(
	buttons: HTMLButtonElement[],
	playerOneInput: HTMLInputElement,
	playerTwoInput: HTMLInputElement,
	form: HTMLFormElement,
	onSelect: () => void = () => {},
	submitter?: HTMLButtonElement,
): void {
	for (const button of buttons) {
		const { playerOne, playerTwo } = button.dataset;
		if (!playerOne || !playerTwo) {
			throw new Error('Matchup preset is missing a player username.');
		}

		button.addEventListener('click', () => {
			playerOneInput.value = playerOne;
			playerTwoInput.value = playerTwo;
			onSelect();
			form.requestSubmit(submitter);
		});
	}
}

export function bindSfxToggle(button: HTMLButtonElement, audio: Pick<ArcadeAudio, 'isMuted' | 'toggleMuted'>): void {
	const renderState = () => {
		const muted = audio.isMuted();
		button.textContent = muted ? '🔇 SFX: OFF' : '🔊 SFX: ON';
		button.setAttribute('aria-pressed', String(!muted));
	};

	renderState();
	button.addEventListener('click', () => {
		audio.toggleMuted();
		renderState();
	});
}

export function renderContributionGrid(
	container: HTMLElement,
	contributions: ContributionDay[],
): void {
	if (contributions.length !== DAYS_IN_WINDOW) {
		throw new Error(`Expected ${DAYS_IN_WINDOW} contribution days.`);
	}

	const cells = contributions.map((contribution) => {
		const cell = document.createElement('span');
		const countLabel = `${contribution.count} contribution${contribution.count === 1 ? '' : 's'}`;
		const label = `${contribution.date}: ${countLabel}`;
		cell.className = 'contribution-cell';
		cell.dataset.level = String(contribution.level);
		cell.title = label;
		cell.setAttribute('role', 'gridcell');
		cell.setAttribute('aria-label', label);
		return cell;
	});

	container.replaceChildren(...cells);
}

export function renderLoadingSkeleton(container: HTMLElement): void {
	const cells = Array.from({ length: DAYS_IN_WINDOW }, () => {
		const cell = document.createElement('span');
		cell.className = 'calendar-skeleton-cell';
		cell.setAttribute('aria-hidden', 'true');
		return cell;
	});

	container.replaceChildren(...cells);
}

function getElement<T extends HTMLElement>(selector: string): T {
	const element = document.querySelector<T>(selector);
	if (!element) {
		throw new Error(`Battle page is missing required element: ${selector}`);
	}
	return element;
}

function renderPlayer(card: HTMLElement, data: ContributionResponse): void {
	const heading = getCardElement<HTMLElement>(card, '[data-profile-name]');
	const avatar = getCardElement<HTMLElement>(card, '[data-avatar]');
	const dateRange = getCardElement<HTMLElement>(card, '[data-date-range]');
	const calendar = getCardElement<HTMLElement>(card, '[data-calendar]');
	const skeleton = getCardElement<HTMLElement>(card, '[data-calendar-skeleton]');
	const stats = calculatePlayerStats(data.contributions);
	const statValues = {
		totalContributions: stats.totalContributions.toLocaleString(),
		longestStreak: `${stats.longestStreak} days`,
		currentStreak: `${stats.currentStreak} days`,
		peakDailyContributions: `${stats.peakDailyContributions.toLocaleString()} · ${stats.peakDay}`,
		consistencyScore: `${stats.consistencyScore}%`,
	};

	heading.textContent = data.username;
	avatar.textContent = data.username.slice(0, 2).toUpperCase();
	avatar.setAttribute('aria-label', `${data.username} avatar placeholder`);
	for (const [key, value] of Object.entries(statValues)) {
		const row = getCardElement<HTMLElement>(card, `[data-stat-row="${key}"]`);
		getCardElement<HTMLElement>(row, '[data-stat-value]').textContent = value;
	}
	dateRange.textContent = `${data.contributions[0].date} – ${data.contributions.at(-1)?.date}`;
	renderContributionGrid(calendar, data.contributions);
	calendar.hidden = false;
	skeleton.hidden = true;
}

function getCardElement<T extends HTMLElement>(card: HTMLElement, selector: string): T {
	const element = card.querySelector<T>(selector);
	if (!element) {
		throw new Error(`Player arena is missing required element: ${selector}`);
	}
	return element;
}

export function initializeBattlePage(): void {
	const form = getElement<HTMLFormElement>('#battle-form');
	const playerOneInput = getElement<HTMLInputElement>('#player-1');
	const playerTwoInput = getElement<HTMLInputElement>('#player-2');
	const submitButton = getElement<HTMLButtonElement>('#battle-submit');
	const sfxToggle = getElement<HTMLButtonElement>('#sfx-toggle');
	const hud = getElement<HTMLElement>('#battle-hud');
	const meterOne = getElement<HTMLElement>('[data-meter="1"]');
	const meterTwo = getElement<HTMLElement>('[data-meter="2"]');
	const meterOneFill = getElement<HTMLElement>('[data-meter-fill="1"]');
	const meterTwoFill = getElement<HTMLElement>('[data-meter-fill="2"]');
	const meterOneValue = getElement<HTMLElement>('[data-meter-value="1"]');
	const meterTwoValue = getElement<HTMLElement>('[data-meter-value="2"]');
	const meterOneName = getElement<HTMLElement>('[data-meter-name="1"]');
	const meterTwoName = getElement<HTMLElement>('[data-meter-name="2"]');
	const clash = getElement<HTMLElement>('#battle-clash');
	const clashText = getElement<HTMLElement>('#battle-clash-text');
	const particles = getElement<HTMLElement>('#battle-particles');
	const readyIndicator = getElement<HTMLElement>('#ready-indicator');
	const status = getElement<HTMLElement>('#battle-status');
	const loading = getElement<HTMLElement>('#battle-loading');
	const error = getElement<HTMLElement>('#battle-error');
	const results = getElement<HTMLElement>('#battle-results');
	const winner = getElement<HTMLElement>('#winner-name');
	const winnerBanner = getElement<HTMLElement>('#winner-banner');
	const scoreboard = getElement<HTMLElement>('#scoreboard');
	const playerOneScore = getElement<HTMLElement>('[data-score="1"]');
	const playerTwoScore = getElement<HTMLElement>('[data-score="2"]');
	const playerOneScoreName = getElement<HTMLElement>('[data-score-name="1"]');
	const playerTwoScoreName = getElement<HTMLElement>('[data-score-name="2"]');
	const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-player-card]'));

	if (cards.length !== 2) {
		throw new Error('Battle page must contain exactly two player arenas.');
	}

	bindSfxToggle(sfxToggle, arcadeAudio);
	submitButton.addEventListener('click', () => arcadeAudio.play('click'));
	bindMatchupPresets(
		Array.from(document.querySelectorAll<HTMLButtonElement>('[data-matchup]')),
		playerOneInput,
		playerTwoInput,
		form,
		() => arcadeAudio.play('click'),
		submitButton,
	);

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (event.submitter !== submitButton) {
			arcadeAudio.play('click');
		}
		const playerOne = playerOneInput.value.trim();
		const playerTwo = playerTwoInput.value.trim();

		if (!playerOne || !playerTwo) {
			status.hidden = false;
			loading.hidden = true;
			error.textContent = 'Enter a GitHub username for both players.';
			error.hidden = false;
			results.hidden = true;
			if (!playerOne) playerOneInput.focus();
			else playerTwoInput.focus();
			return;
		}

		submitButton.disabled = true;
		readyIndicator.hidden = true;
		hud.hidden = false;
		clash.hidden = false;
		winnerBanner.hidden = true;
		particles.replaceChildren();
		document.body.classList.remove('battle-shake');
		winnerBanner.classList.remove('winner-reveal');
		updatePowerMeter(meterOneFill, meterOneValue, meterOne, 0);
		updatePowerMeter(meterTwoFill, meterTwoValue, meterTwo, 0);
		for (const card of cards) {
			for (const row of card.querySelectorAll<HTMLElement>('[data-stat-row]')) {
				row.dataset.revealed = 'false';
				delete row.dataset.outcome;
				getCardElement<HTMLElement>(row, '[data-stat-points]').textContent = '';
			}
		}
		status.hidden = false;
		loading.hidden = false;
		error.hidden = true;
		results.hidden = false;
		scoreboard.hidden = true;
		for (const card of cards) {
			const calendar = getCardElement<HTMLElement>(card, '[data-calendar]');
			const skeleton = getCardElement<HTMLElement>(card, '[data-calendar-skeleton]');
			calendar.hidden = true;
			skeleton.hidden = false;
			renderLoadingSkeleton(skeleton);
		}
		arcadeAudio.play('powerUp');

		const countdownController = new AbortController();
		try {
			const [battleData] = await Promise.all([
				fetchBattle(playerOne, playerTwo),
				runBattleCountdown((stage) => {
					clashText.textContent = stage;
					clashText.dataset.stage = stage;
					clashText.classList.remove('clash-pop');
					void clashText.offsetWidth;
					clashText.classList.add('clash-pop');
				}, animationWait, countdownController.signal),
			]);
			const [playerOneData, playerTwoData] = battleData;
			clash.hidden = true;
			renderPlayer(cards[0], playerOneData);
			renderPlayer(cards[1], playerTwoData);
			animateContributionGrid(getCardElement<HTMLElement>(cards[0], '[data-calendar]'));
			animateContributionGrid(getCardElement<HTMLElement>(cards[1], '[data-calendar]'));
			meterOneName.textContent = playerOneData.username;
			meterTwoName.textContent = playerTwoData.username;
			meterOne.setAttribute('aria-label', `${playerOneData.username} battle score`);
			meterTwo.setAttribute('aria-label', `${playerTwoData.username} battle score`);
			const battle = scoreBattle(
				calculatePlayerStats(playerOneData.contributions),
				calculatePlayerStats(playerTwoData.contributions),
			);
			let playerOneProgress = 0;
			let playerTwoProgress = 0;
			await revealBattleCategories(battle.categories, (category) => {
				arcadeAudio.play('hit');
				for (const [index, card] of cards.entries()) {
					const row = getCardElement<HTMLElement>(card, `[data-stat-row="${category.key}"]`);
					const isPlayerOne = index === 0;
					const outcome = category.outcome === 'tie'
						? 'tie'
						: category.outcome === (isPlayerOne ? 'player1' : 'player2')
							? 'winner'
							: 'loser';
					const points = isPlayerOne ? category.playerOnePoints : category.playerTwoPoints;
					row.dataset.outcome = outcome;
					getCardElement<HTMLElement>(row, '[data-stat-points]').textContent =
						`+${points} ${points === 1 ? 'point' : 'points'}`;
					row.dataset.revealed = 'true';
				}
				playerOneProgress += category.playerOnePoints;
				playerTwoProgress += category.playerTwoPoints;
				updatePowerMeter(meterOneFill, meterOneValue, meterOne, playerOneProgress);
				updatePowerMeter(meterTwoFill, meterTwoValue, meterTwo, playerTwoProgress);
			});
			playerOneScoreName.textContent = playerOneData.username;
			playerTwoScoreName.textContent = playerTwoData.username;
			playerOneScore.textContent = `${battle.playerOneScore} / 5`;
			playerTwoScore.textContent = `${battle.playerTwoScore} / 5`;
			winner.textContent = battle.winner === 'tie'
				? `DRAW! (${battle.playerOneScore}–${battle.playerTwoScore})`
				: `K.O. — ${battle.winner === 'player1' ? playerOneData.username : playerTwoData.username} wins ${battle.playerOneScore}–${battle.playerTwoScore}!`;
			winnerBanner.hidden = false;
			scoreboard.hidden = false;
			triggerBattleCelebration(battle.winner, winnerBanner, particles, document.body);
			arcadeAudio.play('victory');
			status.hidden = true;
		} catch (cause) {
			countdownController.abort();
			clash.hidden = true;
			hud.hidden = true;
			document.body.classList.remove('battle-shake');
			particles.replaceChildren();
			results.hidden = true;
			readyIndicator.hidden = false;
			status.hidden = false;
			loading.hidden = true;
			error.textContent =
				cause instanceof Error
					? cause.message
					: 'Could not load contribution data. Please try again.';
			error.hidden = false;
		} finally {
			submitButton.disabled = false;
			loading.hidden = true;
		}
	});
}
