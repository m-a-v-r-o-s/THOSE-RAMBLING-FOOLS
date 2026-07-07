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
    hintDismissed,
    dismissHint,
    selectAlbum,
    playRandomAlbum,
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
    ? '/covers/button.webp'
    : isPaused
    ? '/covers/buttonstart.webp'
    : '/covers/buttonstop.webp';

  return (
    <>
      <div className="player-scene">

        <Link href="/our-story" className="side-link side-link-left">
          <img src="/covers/ramblings2.webp" className="side-link-img" alt="Ramblings" />
          <img src="/covers/ramblings2mob.webp" className="side-link-img-mobile" alt="Ramblings" />
          <span className="side-link-text">Ramblings</span>
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
              <img src="/covers/arm.webp" alt="" />
            </div>

            <button
              className="start-stop-btn"
              onClick={() => {
                dismissHint();
                if (currentAlbum) togglePlay();
                else playRandomAlbum();
              }}
              style={{ backgroundImage: `url('${startStopImg}')` }}
              aria-label={currentAlbum ? 'Start or stop playback' : 'Play a random album'}
              title="Start / Stop"
            />
          </div>

          <div
            className={`spin-hint${hintDismissed ? ' hidden' : ''}`}
            aria-hidden="true"
          >
            <svg className="spin-hint-arrow" viewBox="0 0 64 64" fill="none">
              <path
                d="M56 8 C 52 30, 44 48, 12 55"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 55 L 27 59 M12 55 L 24 45"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="spin-hint-text">Press to spin</span>
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
          <img src="/covers/gigs.webp" className="side-link-img" alt="Upcoming Gigs" />
          <img src="/covers/buttonhor.webp" className="side-link-img-mobile" alt="Upcoming Gigs" />
          <span className="side-link-text">Upcoming Gigs</span>
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
            onClick={() => {
              dismissHint();
              togglePlay();
            }}
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
