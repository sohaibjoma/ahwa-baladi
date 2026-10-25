// Procedural ahwa sounds: every effect is synthesized live with the Web Audio API, no audio files.

type Overtone = readonly [ratio: number, level: number, decay: number];

interface Synth {
  ctx: AudioContext;
  out: GainNode;
  noise: AudioBuffer;
}

/** Inharmonic partials of a thin tea glass and of a small desk bell. */
const GLASS: readonly Overtone[] = [
  [1, 1, 0.5],
  [2.32, 0.5, 0.3],
  [4.25, 0.25, 0.16]
];
const BELL: readonly Overtone[] = [
  [1, 1, 1.6],
  [2.76, 0.45, 0.9],
  [5.4, 0.25, 0.5],
  [8.93, 0.12, 0.3]
];

let synth: Synth | null = null;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
  if (synth)
    synth.out.gain.setTargetAtTime(value ? 0 : 1, synth.ctx.currentTime, 0.015);
}

/** Lazily creates the context on the first user gesture; null while muted or on the server. */
function getSynth(): Synth | null {
  if (muted || typeof window === 'undefined') return null;
  if (!synth) {
    const ctx = new AudioContext();
    const out = ctx.createGain();
    out.connect(ctx.destination);
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    synth = { ctx, out, noise };
  }
  if (synth.ctx.state === 'suspended') void synth.ctx.resume();
  return synth;
}

/** A struck tone: sine partials with a sharp attack and exponential decay. */
function strike(
  a: Synth,
  at: number,
  frequency: number,
  level: number,
  partials: readonly Overtone[]
) {
  for (const [ratio, amplitude, decay] of partials) {
    const osc = a.ctx.createOscillator();
    const gain = a.ctx.createGain();
    osc.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level * amplitude, at + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(gain).connect(a.out);
    osc.start(at);
    osc.stop(at + decay);
  }
}

/** Looping white noise through a sweeping filter; returns the filter so callers can modulate it. */
function sweptNoise(
  a: Synth,
  at: number,
  duration: number,
  type: BiquadFilterType,
  [from, to]: readonly [number, number],
  level: number,
  q = 1
) {
  const source = a.ctx.createBufferSource();
  const filter = a.ctx.createBiquadFilter();
  const gain = a.ctx.createGain();
  source.buffer = a.noise;
  source.loop = true;
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, at + duration);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(
    level,
    at + Math.min(0.08, duration / 4)
  );
  gain.gain.setValueAtTime(level, at + duration * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(filter).connect(gain).connect(a.out);
  source.start(at);
  source.stop(at + duration);
  return filter;
}

/** رنة المعلقة في الكوباية: "tak-taka", three quick, slightly uneven spoon strikes on glass. */
export function playClink() {
  const a = getSynth();
  if (!a) return;
  const now = a.ctx.currentTime;
  for (const [offset, velocity, frequency] of [
    [0, 1, 2480],
    [0.12, 0.6, 2550],
    [0.21, 0.8, 2510]
  ]) {
    strike(a, now + offset, frequency, 0.22 * velocity, GLASS);
  }
}

/** Hot tea pouring: filtered noise whose pitch rises as the glass fills, with a bubbly wobble. */
export function playPour() {
  const a = getSynth();
  if (!a) return;
  const now = a.ctx.currentTime;
  const duration = 1.6;
  const filter = sweptNoise(
    a,
    now,
    duration,
    'bandpass',
    [420, 1700],
    0.35,
    1.2
  );
  const wobble = a.ctx.createOscillator();
  const depth = a.ctx.createGain();
  wobble.frequency.value = 9;
  depth.gain.value = 120;
  wobble.connect(depth).connect(filter.frequency);
  wobble.start(now);
  wobble.stop(now + duration);
}

/** A sugar cube plopping in: a falling "bloop" followed by a tiny splash. */
export function playPlop() {
  const a = getSynth();
  if (!a) return;
  const now = a.ctx.currentTime;
  const osc = a.ctx.createOscillator();
  const gain = a.ctx.createGain();
  osc.frequency.setValueAtTime(820, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.14);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.45, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain).connect(a.out);
  osc.start(now);
  osc.stop(now + 0.16);
  sweptNoise(a, now + 0.03, 0.12, 'highpass', [2400, 1800], 0.12);
}

/** شفطة: a noisy slurp sweeping down. */
export function playSlurp() {
  const a = getSynth();
  if (!a) return;
  sweptNoise(a, a.ctx.currentTime, 0.4, 'bandpass', [2800, 700], 0.3, 4);
}

/** A retro desk bell, ding-ding, for when the tea is ready. */
export function playBell() {
  const a = getSynth();
  if (!a) return;
  const now = a.ctx.currentTime;
  strike(a, now, 1568, 0.3, BELL);
  strike(a, now + 0.32, 1568, 0.24, BELL);
}
