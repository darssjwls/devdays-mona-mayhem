export type ArcadeSoundEffect = 'click' | 'powerUp' | 'hit' | 'victory';

type AudioContextFactory = () => AudioContext | null;
type Tone = {
	frequency: number;
	delay: number;
	duration: number;
	waveform?: OscillatorType;
	volume?: number;
	endFrequency?: number;
};

export type ArcadeAudio = {
	play(effect: ArcadeSoundEffect): void;
	setMuted(value: boolean): void;
	toggleMuted(): boolean;
	isMuted(): boolean;
};

function createBrowserAudioContext(): AudioContext | null {
	if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') {
		return null;
	}

	return new window.AudioContext();
}

function scheduleTone(
	context: AudioContext,
	master: GainNode,
	{ frequency, delay, duration, waveform = 'square', volume = 0.08, endFrequency }: Tone,
): void {
	const startAt = context.currentTime + delay;
	const oscillator = context.createOscillator();
	const envelope = context.createGain();

	oscillator.type = waveform;
	oscillator.frequency.setValueAtTime(frequency, startAt);
	if (endFrequency !== undefined) {
		oscillator.frequency.linearRampToValueAtTime(endFrequency, startAt + duration);
	}

	envelope.gain.setValueAtTime(0.0001, startAt);
	envelope.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
	envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
	oscillator.connect(envelope);
	envelope.connect(master);
	oscillator.start(startAt);
	oscillator.stop(startAt + duration + 0.01);
}

function playEffect(effect: ArcadeSoundEffect, context: AudioContext, master: GainNode): void {
	switch (effect) {
		case 'click':
			scheduleTone(context, master, { frequency: 880, delay: 0, duration: 0.055, volume: 0.045 });
			scheduleTone(context, master, { frequency: 1320, delay: 0.045, duration: 0.07, volume: 0.035 });
			break;
		case 'powerUp':
			[392, 494, 587, 784].forEach((frequency, index) => {
				scheduleTone(context, master, {
					frequency,
					delay: index * 0.105,
					duration: 0.16,
					volume: 0.045,
				});
			});
			break;
		case 'hit':
			scheduleTone(context, master, { frequency: 145, delay: 0, duration: 0.11, volume: 0.1 });
			scheduleTone(context, master, { frequency: 82, delay: 0.015, duration: 0.13, waveform: 'triangle', volume: 0.07 });
			break;
		case 'victory':
			[523, 659, 784, 1047, 784, 1047].forEach((frequency, index) => {
				scheduleTone(context, master, {
					frequency,
					delay: index * 0.13,
					duration: index === 5 ? 0.34 : 0.12,
					volume: 0.055,
				});
			});
			break;
	}
}

export function createArcadeAudio(contextFactory: AudioContextFactory = createBrowserAudioContext): ArcadeAudio {
	let context: AudioContext | null = null;
	let master: GainNode | null = null;
	let muted = false;
	let unavailable = false;

	function ensureContext(): AudioContext | null {
		if (!context && !unavailable) {
			try {
				context = contextFactory();
				unavailable = context === null;
			} catch {
				unavailable = true;
			}
		}

		return context;
	}

	function ensureMaster(audioContext: AudioContext): GainNode {
		if (!master) {
			master = audioContext.createGain();
			master.gain.setValueAtTime(muted ? 0 : 1, audioContext.currentTime);
			master.connect(audioContext.destination);
		}

		return master;
	}

	return {
		play(effect: ArcadeSoundEffect): void {
			if (muted) return;

			const audioContext = ensureContext();
			if (!audioContext) return;

			try {
				if (audioContext.state === 'suspended') {
					void audioContext.resume().catch(() => undefined);
				}
				playEffect(effect, audioContext, ensureMaster(audioContext));
			} catch {
				// Audio is optional; synthesis failures must not interrupt a battle.
			}
		},

		setMuted(value: boolean): void {
			muted = value;
			if (!context || !master) return;

			try {
				master.gain.setTargetAtTime(muted ? 0 : 1, context.currentTime, 0.015);
			} catch {
				master.gain.value = muted ? 0 : 1;
			}
		},

		toggleMuted(): boolean {
			this.setMuted(!muted);
			return muted;
		},

		isMuted(): boolean {
			return muted;
		},
	};
}

export const arcadeAudio = createArcadeAudio();
