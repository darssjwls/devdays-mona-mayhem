import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createArcadeAudio } from '../src/scripts/arcade-audio.ts';

function createFakeAudioContext() {
	const oscillators = [];
	const gains = [];
	const context = {
		currentTime: 10,
		state: 'running',
		destination: {},
		createOscillator() {
			const oscillator = {
				frequency: {
					values: [],
					setValueAtTime(value, time) { this.values.push([value, time]); },
					linearRampToValueAtTime(value, time) { this.values.push([value, time]); },
				},
				connect(target) { this.connectedTo = target; },
				start(time) { this.startedAt = time; },
				stop(time) { this.stoppedAt = time; },
			};
			oscillators.push(oscillator);
			return oscillator;
		},
		createGain() {
			const gain = {
				gain: {
					value: 1,
					values: [],
					setValueAtTime(value, time) { this.values.push(['set', value, time]); },
					exponentialRampToValueAtTime(value, time) { this.values.push(['ramp', value, time]); },
					setTargetAtTime(value, time, constant) { this.values.push(['target', value, time, constant]); },
				},
				connect(target) { this.connectedTo = target; },
			};
			gains.push(gain);
			return gain;
		},
		resume() { this.state = 'running'; return Promise.resolve(); },
	};

	return { context, oscillators, gains };
}

test('synthesizes click, power-up, stat-hit, and victory sounds with Web Audio nodes', () => {
	const fake = createFakeAudioContext();
	const audio = createArcadeAudio(() => fake.context);

	for (const effect of ['click', 'powerUp', 'hit', 'victory']) {
		audio.play(effect);
	}

	assert.equal(fake.oscillators.length, 14);
	assert.ok(fake.oscillators.every((oscillator) => oscillator.startedAt >= 10));
	assert.ok(fake.oscillators.every((oscillator) => oscillator.stoppedAt > oscillator.startedAt));
	assert.ok(fake.oscillators.every((oscillator) => oscillator.connectedTo !== fake.context.destination));
	assert.ok(fake.gains[0].connectedTo === fake.context.destination);
	assert.ok(fake.gains.slice(1).every((gain) => gain.gain.values.some(([type]) => type === 'ramp')));
});

test('mute silences active output and prevents later effects until unmuted', () => {
	const fake = createFakeAudioContext();
	let contextCreations = 0;
	const audio = createArcadeAudio(() => {
		contextCreations += 1;
		return fake.context;
	});

	audio.setMuted(true);
	audio.play('click');
	assert.equal(contextCreations, 0);

	audio.setMuted(false);
	audio.play('click');
	const masterGain = fake.gains[0];
	assert.equal(fake.oscillators.length, 2);

	audio.setMuted(true);
	assert.deepEqual(
		masterGain.gain.values.slice(-1)[0].slice(0, 2),
		['target', 0],
	);
	audio.play('hit');
	assert.equal(fake.oscillators.length, 2);

	audio.setMuted(false);
	audio.play('hit');
	assert.equal(fake.oscillators.length, 4);
});

test('audio effects safely no-op when Web Audio is unavailable', () => {
	const audio = createArcadeAudio(() => null);

	assert.doesNotThrow(() => {
		audio.play('click');
		audio.play('victory');
	});
	assert.equal(audio.isMuted(), false);
});
