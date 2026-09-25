import { useSyncExternalStore } from 'react';
import { ALBUMS, type Album } from '../albums';

// Player state for the whole visit. In the Next app this lived in a React
// context mounted in the root layout, so audio kept playing across client-side
// navigation. Astro islands are separate React roots, so the state and the one
// <audio> element live at module scope instead: with <ClientRouter /> the page
// is swapped without reloading JS, this module survives every navigation, and
// the Turntable island simply re-reads the current state when it remounts.

type AudioState = {
  currentAlbum: Album | null;
  isPaused: boolean;
  isRecordPlaying: boolean;
  isTonearmDown: boolean;
  isRecordVisible: boolean;
  isNowPlayingVisible: boolean;
  recordLabelImg: string;
  hintDismissed: boolean;
};

const INITIAL: AudioState = {
  currentAlbum: null,
  isPaused: false,
  isRecordPlaying: false,
  isTonearmDown: false,
  isRecordVisible: false,
  isNowPlayingVisible: false,
  recordLabelImg: '',
  hintDismissed: false,
};

let state = INITIAL;
const listeners = new Set<() => void>();
let playTimeout: ReturnType<typeof setTimeout> | null = null;
let audioEl: HTMLAudioElement | null = null;

function set(patch: Partial<AudioState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function audio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'metadata';
    audioEl.addEventListener('play', () =>
      set({ isPaused: false, isTonearmDown: true, isRecordPlaying: true })
    );
    audioEl.addEventListener('pause', () => set({ isPaused: true, isTonearmDown: false }));
    audioEl.addEventListener('ended', () =>
      set({ isPaused: true, isRecordPlaying: false, isTonearmDown: false })
    );
  }
  return audioEl;
}

function clearPlayTimeout() {
  if (playTimeout) clearTimeout(playTimeout);
}

function load(album: Album) {
  const a = audio();
  a.src = album.audio;
  a.load();
}

function dismissHint() {
  set({ hintDismissed: true });
}

function selectAlbum(album: Album) {
  if (state.currentAlbum?.key === album.key) return;
  clearPlayTimeout();
  set({
    recordLabelImg: album.label ?? album.cover,
    isRecordVisible: true,
    isRecordPlaying: false,
    isPaused: true,
    isTonearmDown: false,
    isNowPlayingVisible: true,
    currentAlbum: album,
  });
  load(album);
}

// Pressing Start with nothing loaded: drops a random disk on and plays it
// straight away, instead of just sitting there disabled.
function playRandomAlbum() {
  const album = ALBUMS[Math.floor(Math.random() * ALBUMS.length)];
  clearPlayTimeout();
  set({
    recordLabelImg: album.label ?? album.cover,
    isRecordVisible: true,
    isRecordPlaying: false,
    isPaused: false,
    isTonearmDown: true,
    isNowPlayingVisible: true,
    currentAlbum: album,
  });
  load(album);
  playTimeout = setTimeout(() => {
    set({ isRecordPlaying: true });
    audio().play();
  }, 1100);
}

function eject() {
  clearPlayTimeout();
  if (audioEl) {
    audioEl.pause();
    audioEl.currentTime = 0;
  }
  set({
    isRecordPlaying: false,
    isTonearmDown: false,
    isRecordVisible: false,
    isNowPlayingVisible: false,
    isPaused: false,
    currentAlbum: null,
  });
}

function togglePlay() {
  if (!state.currentAlbum) return;
  const willPause = !state.isPaused;
  set({ isPaused: willPause, isTonearmDown: !willPause });
  if (willPause) {
    clearPlayTimeout();
    audioEl?.pause();
  } else {
    playTimeout = setTimeout(() => {
      set({ isRecordPlaying: true });
      audio().play();
    }, 1100);
  }
}

function seek(delta: number) {
  const a = audioEl;
  if (!a || !state.currentAlbum) return;
  const max = Number.isFinite(a.duration) ? a.duration : a.currentTime + delta;
  a.currentTime = Math.max(0, Math.min(max, a.currentTime + delta));
}

function setVolume(v: number) {
  audio().volume = v;
}

const actions = {
  dismissHint,
  selectAlbum,
  playRandomAlbum,
  togglePlay,
  eject,
  seek,
  setVolume,
};

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
