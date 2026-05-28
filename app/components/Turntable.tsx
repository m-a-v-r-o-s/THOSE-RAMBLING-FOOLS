'use client';

import Link from 'next/link';
import { useCallback, useRef } from 'react';
import { ALBUMS, type Album } from '../albums';
import { useAudio } from './AudioProvider';

export default function Turntable() {
  const {
    currentAlbum,
    isPaused,
    isRecordPlaying,
    isTonearmDown,
    isRecordVisible,
    isNowPlayingVisible,
    recordLabelImg,
    selectAlbum,
    togglePlay,
    eject,
    seek,
    setVolume,
  } = useAudio();

  const platterRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handlePick = useCallback(
    (album: Album) => {
      if (currentAlbum?.key === album.key) eject();
      else selectAlbum(album);
    },
    [currentAlbum, eject, selectAlbum]
  );

  const startStopImg = !currentAlbum
    ? '/covers/button.png'
    : isPaused
    ? '/covers/buttonstart.png'
    : '/covers/buttonstop.png';

  return (
    <>
      <div className="player-scene">

        <Link href="/our-story" className="side-link side-link-left">
          Our Story
        </Link>

        {/* Left sidebar — albums I & II */}
        <div className="album-sidebar">
          <nav className="shelf">
            {ALBUMS.slice(0, 2).map((al) => (
              <button
                key={al.key}
                ref={(el) => { buttonRefs.current[al.key] = el; }}
                className={[
                  'vinyl-pick',
                  al.key,
                  currentAlbum?.key === al.key ? 'selected active' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handlePick(al)}
                aria-label={
                  currentAlbum?.key === al.key
                    ? `Eject album ${al.title}`
                    : `Play album ${al.title}`
                }
              >
                <div className="sleeve" style={{ backgroundImage: `url('${al.cover}')` }} />
                <div className="vinyl-disc">
                  <div className="label" style={{ backgroundImage: `url('${al.cover}')` }} />
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Turntable */}
        <div className="turntable-wrap">
          <div className="turntable">
            <div className="platter" ref={platterRef}>
              <div className="record-spinner">
                <div
                  className={[
                    'record',
                    isRecordVisible ? 'show' : '',
                    isRecordPlaying ? 'playing' : '',
                    isPaused ? 'paused' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div
                    className="record-label"
                    style={{
                      backgroundImage: recordLabelImg
                        ? `url('${recordLabelImg}')`
                        : undefined,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className={`tonearm${isTonearmDown ? ' playing' : ''}`}>
              <img src="/covers/arm.png" alt="" />
            </div>

            <button
              className="start-stop-btn"
              onClick={togglePlay}
              disabled={!currentAlbum}
              style={{ backgroundImage: `url('${startStopImg}')` }}
              aria-label="Start or stop playback"
              title="Start / Stop"
            />
          </div>
        </div>

        {/* Right sidebar — albums III & IV */}
        <div className="album-sidebar">
          <nav className="shelf">
            {ALBUMS.slice(2, 4).map((al) => (
              <button
                key={al.key}
                ref={(el) => { buttonRefs.current[al.key] = el; }}
                className={[
                  'vinyl-pick',
                  al.key,
                  currentAlbum?.key === al.key ? 'selected active' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handlePick(al)}
                aria-label={
                  currentAlbum?.key === al.key
                    ? `Eject album ${al.title}`
                    : `Play album ${al.title}`
                }
              >
                <div className="sleeve" style={{ backgroundImage: `url('${al.cover}')` }} />
                <div className="vinyl-disc">
                  <div className="label" style={{ backgroundImage: `url('${al.cover}')` }} />
                </div>
              </button>
            ))}
          </nav>
        </div>

        <Link href="/upcoming-gigs" className="side-link side-link-right">
          Upcoming Gigs
        </Link>

      </div>

      <section
        className={`now-playing${isNowPlayingVisible ? ' visible' : ''}`}
      >
        <div className="now-playing-label">
          {currentAlbum ? `Now spinning · ${currentAlbum.title}` : 'Now spinning'}
        </div>
        <div className="mini-player">
          <button
            className="mini-skip"
            onClick={() => seek(-60)}
            disabled={!currentAlbum}
            aria-label="Rewind 1 minute"
          >
            ◀◀
          </button>
          <button
            className="mini-play"
            onClick={togglePlay}
            disabled={!currentAlbum}
            aria-label={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? '▶' : '❚❚'}
          </button>
          <button
            className="mini-skip"
            onClick={() => seek(60)}
            disabled={!currentAlbum}
            aria-label="Forward 1 minute"
          >
            ▶▶
          </button>
          <input
            className="mini-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            defaultValue={1}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </section>
    </>
  );
}
