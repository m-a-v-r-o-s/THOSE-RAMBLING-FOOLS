import { useSyncExternalStore } from 'react';
import { ALBUMS, type Album } from '../albums';
import { setSfxVolume, sfx } from './sfx';

// Player state for the whole visit. Astro islands are separate React roots, so
// the state and the one <audio> element live at module scope: with
// <ClientRouter /> the page is swapped without reloading JS, this module
// survives every navigation, and each island re-reads the state on remount.
//
// The deck behaves like a real one:
//   idle     no record
//   cued     record on the platter, arm on its rest, motor off
//   loading  motor on, arm swinging over, needle about to land
//   playing  motor on, needle down, sound
//   stopped  motor braked, needle still down, sound wound down
export type Phase = 'idle' | 'cued' | 'loading' | 'playing' | 'stopped';
export type Speed = 33 | 45;

type AudioState = {
  current: Album | null;
  phase: Phase;
  speed: Speed;
  time: number;
  duration: number;
  volume: number;
  hintDismissed: boolean;
  // Bumped each time a record is picked, so the title card replays.
  pickCount: number;
};

const INITIAL: AudioState = {
  current: null,
  phase: 'idle',
  speed: 33,
  time: 0,
  duration: 0,
  volume: 1,
  hintDismissed: false,
  pickCount: 0,
};

const NEEDLE_DROP_MS = 1100;
const RPM: Record<Speed, number> = { 33: 33 + 1 / 3, 45: 45 };

let state = INITIAL;
const listeners = new Set<() => void>();
let dropTimer: ReturnType<typeof setTimeout> | null = null;
let rampFrame = 0;
let audioEl: HTMLAudioElement | null = null;

function set(patch: Partial<AudioState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const nativeSpeed = (r: Album): Speed => (r.single ? 45 : 33);
// Pressing the "wrong" speed button plays the record fast or slow, pitch and all.
const baseRate = () => (state.current ? RPM[state.speed] / RPM[nativeSpeed(state.current)] : 1);

function audio(): HTMLAudioElement {
  if (!audioEl) {
    const a = new Audio();
    a.preload = 'metadata';
    a.preservesPitch = false;
    (a as unknown as { webkitPreservesPitch: boolean }).webkitPreservesPitch = false;
    a.addEventListener('timeupdate', () => set({ time: a.currentTime }));
    a.addEventListener('loadedmetadata', () => set({ duration: a.duration }));
    a.addEventListener('ended', () => {
      sfx.needleUp();
      a.currentTime = 0;
      set({ phase: 'cued', time: 0 });
    });
    audioEl = a;
  }
  return audioEl;
}

function clearTimers() {
  if (dropTimer) clearTimeout(dropTimer);
  dropTimer = null;
  cancelAnimationFrame(rampFrame);
}

// Eases playbackRate between two multiples of the base rate: the platter
// winding down on Stop, or catching up on Start.
function ramp(from: number, to: number, ms: number, done?: () => void) {
  cancelAnimationFrame(rampFrame);
  const a = audio();
  const t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    const eased = 1 - (1 - k) * (1 - k);
    a.playbackRate = baseRate() * (from + (to - from) * eased);
    if (k < 1) rampFrame = requestAnimationFrame(step);
    else done?.();
  };
  step();
}

function startSequence() {
  clearTimers();
  set({ phase: 'loading' });
  dropTimer = setTimeout(() => {
    sfx.needleDown();
    const a = audio();
    a.playbackRate = baseRate();
    a.play().catch(() => set({ phase: 'cued' }));
    set({ phase: 'playing' });
  }, NEEDLE_DROP_MS);
}

function pick(record: Album) {
  set({ hintDismissed: true });
  if (state.current?.key === record.key) return eject();
  clearTimers();
  const a = audio();
  a.pause();
  a.src = record.audio;
  a.load();
  // Called from a click: touching play() here lets the delayed play() after
  // the needle drop through on browsers that tie sound to the gesture.
  a.play().catch(() => {});
  a.pause();
  set({
    current: record,
    phase: 'cued',
    speed: nativeSpeed(record),
    time: 0,
    duration: 0,
    pickCount: state.pickCount + 1,
  });
  startSequence();
}

function playRandomAlbum() {
  pick(ALBUMS[Math.floor(Math.random() * ALBUMS.length)]);
}

function eject() {
  clearTimers();
  if (state.phase === 'playing' || state.phase === 'stopped') sfx.needleUp();
  if (audioEl) {
    audioEl.pause();
    audioEl.currentTime = 0;
  }
  set({ current: null, phase: 'idle', time: 0, duration: 0 });
}

// Start/Stop on the deck and the play/pause button in the bar.
function togglePlay() {
  set({ hintDismissed: true });
  switch (state.phase) {
    case 'idle':
      return playRandomAlbum();
    case 'cued':
      return startSequence();
    case 'loading':
      return;
    case 'playing':
      set({ phase: 'stopped' });
      ramp(1, 0.25, 700, () => audio().pause());
      return;
    case 'stopped': {
      const a = audio();
      a.playbackRate = baseRate() * 0.3;
      a.play().catch(() => set({ phase: 'stopped' }));
      set({ phase: 'playing' });
      ramp(0.3, 1, 600);
      return;
    }
  }
}

function setSpeed(speed: Speed) {
  if (speed === state.speed) return;
  set({ speed });
  if (state.phase === 'playing') audio().playbackRate = baseRate();
}

function seek(delta: number) {
  const a = audioEl;
  if (!a || !state.current) return;
  const max = Number.isFinite(a.duration) ? a.duration : a.currentTime + delta;
  a.currentTime = Math.max(0, Math.min(max, a.currentTime + delta));
}

function seekTo(seconds: number) {
  if (!audioEl || !state.current) return;
  audioEl.currentTime = seconds;
}

function setVolume(v: number) {
  audio().volume = v;
  setSfxVolume(v);
  set({ volume: v });
}

const actions = { pick, playRandomAlbum, togglePlay, eject, seek, seekTo, setSpeed, setVolume };

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAudio() {
  // Server snapshot is always the idle state, so hydration matches the
  // prerendered HTML and React then re-renders with the live state.
  const s = useSyncExternalStore(subscribe, () => state, () => INITIAL);
  return { ...s, ...actions };
}
