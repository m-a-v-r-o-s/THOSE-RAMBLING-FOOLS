'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ALBUMS, type Album } from '../albums';

type AudioCtx = {
  currentAlbum: Album | null;
  isPaused: boolean;
  isRecordPlaying: boolean;
  isTonearmDown: boolean;
  isRecordVisible: boolean;
  isNowPlayingVisible: boolean;
  recordLabelImg: string;
  hintDismissed: boolean;
  dismissHint: () => void;
  selectAlbum: (album: Album) => void;
  playRandomAlbum: () => void;
  togglePlay: () => void;
  eject: () => void;
  seek: (delta: number) => void;
  setVolume: (v: number) => void;
};

const AudioContext = createContext<AudioCtx | null>(null);

export function useAudio(): AudioCtx {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}

export default function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecordVisible, setIsRecordVisible] = useState(false);
  const [isRecordPlaying, setIsRecordPlaying] = useState(false);
  const [isTonearmDown, setIsTonearmDown] = useState(false);
  const [isNowPlayingVisible, setIsNowPlayingVisible] = useState(false);
  const [recordLabelImg, setRecordLabelImg] = useState('');
  const [hintDismissed, setHintDismissed] = useState(false);

  const dismissHint = useCallback(() => setHintDismissed(true), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => {
      setIsPaused(false);
      setIsTonearmDown(true);
      setIsRecordPlaying(true);
    };
    const onPause = () => {
      setIsPaused(true);
      setIsTonearmDown(false);
    };
    const onEnded = () => {
      setIsPaused(true);
      setIsRecordPlaying(false);
      setIsTonearmDown(false);
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const selectAlbum = useCallback(
    (album: Album) => {
      if (currentAlbum?.key === album.key) return;
      if (playTimeout.current) clearTimeout(playTimeout.current);
      setRecordLabelImg(album.cover);
      setIsRecordVisible(true);
      setIsRecordPlaying(false);
      setIsPaused(true);
      setIsTonearmDown(false);
      setIsNowPlayingVisible(true);
      setCurrentAlbum(album);
      const audio = audioRef.current;
      if (audio) {
        audio.src = album.audio;
        audio.load();
      }
    },
    [currentAlbum]
  );

  // Pressing Start with nothing loaded: drop a random disk on and play it
  // straight away, instead of just sitting there disabled.
  const playRandomAlbum = useCallback(() => {
    const album = ALBUMS[Math.floor(Math.random() * ALBUMS.length)];
    if (playTimeout.current) clearTimeout(playTimeout.current);
    setRecordLabelImg(album.cover);
    setIsRecordVisible(true);
    setIsRecordPlaying(false);
    setIsPaused(false);
    setIsTonearmDown(true);
    setIsNowPlayingVisible(true);
    setCurrentAlbum(album);
    const audio = audioRef.current;
    if (audio) {
      audio.src = album.audio;
      audio.load();
    }
    playTimeout.current = setTimeout(() => {
      setIsRecordPlaying(true);
      audioRef.current?.play();
    }, 1100);
  }, []);

  const eject = useCallback(() => {
    if (playTimeout.current) clearTimeout(playTimeout.current);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsRecordPlaying(false);
    setIsTonearmDown(false);
    setIsRecordVisible(false);
    setIsNowPlayingVisible(false);
    setIsPaused(false);
    setCurrentAlbum(null);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentAlbum) return;
    const willPause = !isPaused;
    setIsPaused(willPause);
    setIsTonearmDown(!willPause);
    if (willPause) {
      if (playTimeout.current) clearTimeout(playTimeout.current);
      audioRef.current?.pause();
    } else {
      playTimeout.current = setTimeout(() => {
        setIsRecordPlaying(true);
        audioRef.current?.play();
      }, 1100);
    }
  }, [currentAlbum, isPaused]);

  const seek = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio || !currentAlbum) return;
      const max = Number.isFinite(audio.duration)
        ? audio.duration
        : audio.currentTime + delta;
      audio.currentTime = Math.max(0, Math.min(max, audio.currentTime + delta));
    },
    [currentAlbum]
  );

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return (
    <AudioContext.Provider
      value={{
        currentAlbum,
        isPaused,
        isRecordPlaying,
        isTonearmDown,
        isRecordVisible,
        isNowPlayingVisible,
        recordLabelImg,
        hintDismissed,
        dismissHint,
        selectAlbum,
        playRandomAlbum,
        togglePlay,
        eject,
        seek,
        setVolume,
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" />
    </AudioContext.Provider>
  );
}
