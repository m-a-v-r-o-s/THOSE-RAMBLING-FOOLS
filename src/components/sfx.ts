// Deck sound effects, synthesized with Web Audio so there are no sample files
// to load. The context is created on the first call, which always comes from a
// click, so browsers allow it to make sound.

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let crackle: AudioBuffer | null = null;
let level = 1;

export function setSfxVolume(v: number) {
  level = v;
}

function ac(): AudioContext | null {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const n = noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;
    // Surface noise for the needle landing: sparse pops that thin out.
    crackle = ctx.createBuffer(1, ctx.sampleRate * 0.7, ctx.sampleRate);
    const c = crackle.getChannelData(0);
    for (let i = 0; i < c.length; i++) {
      const fade = 1 - i / c.length;
      if (Math.random() < 0.0016 * fade) c[i] = (Math.random() * 2 - 1) * fade;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function env(c: AudioContext, t: number, gain: number, dur: number) {
  const g = c.createGain();
  g.gain.setValueAtTime(Math.max(0.0001, gain * level), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(c.destination);
  return g;
}

// Filtered noise: the mechanical "click" part of a switch.
function burst(c: AudioContext, t: number, freq: number, q: number, dur: number, gain: number, type: BiquadFilterType = 'bandpass', buf = noise) {
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  src.connect(f).connect(env(c, t, gain, dur));
  src.start(t);
  src.stop(t + dur + 0.02);
}

// A falling sine: the body of the deck taking the hit.
function thump(c: AudioContext, t: number, freq: number, dur: number, gain: number) {
  const o = c.createOscillator();
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + dur);
  o.connect(env(c, t, gain, dur));
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  // Start/Stop: a heavy two-stage clunk, press then release.
  startStop() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    burst(c, t, 2200, 1.1, 0.035, 0.45);
    thump(c, t, 105, 0.11, 0.55);
    burst(c, t + 0.075, 3400, 2, 0.02, 0.18);
  },
  // 33 / 45: a small, bright tick.
  speed() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    burst(c, t, 4400, 3, 0.018, 0.32);
    thump(c, t, 240, 0.04, 0.18);
  },
  // Needle meets the record: a low thud, then a short run of surface crackle.
  needleDown() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    thump(c, t, 72, 0.2, 0.45);
    burst(c, t + 0.02, 1800, 0.6, 0.7, 0.9, 'highpass', crackle);
  },
  // Needle lifts off: a soft scrape.
  needleUp() {
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    burst(c, t, 1600, 0.8, 0.07, 0.12, 'highpass');
    thump(c, t, 150, 0.05, 0.15);
  },
};
