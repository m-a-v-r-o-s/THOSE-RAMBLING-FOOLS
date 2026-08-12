'use client';

import Image from 'next/image';
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

  const renderPick = (al: Album, extraClass = '') => (
    <button
      key={al.key}
      ref={(el) => { buttonRefs.current[al.key] = el; }}
      className={[
        'vinyl-pick',
        al.key,
        extraClass,
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
        <div className="label" style={{ backgroundImage: `url('${al.label ?? al.cover}')` }} />
      </div>
    </button>
  );

  const albumThree = ALBUMS.find((al) => al.key === 'album-3')!;
  const albumFive = ALBUMS.find((al) => al.key === 'album-5')!;

  return (
    <>
      <div className="player-scene">

        <Link href="/our-story" className="side-link side-link-left">
          <Image
            src="/covers/ramblings2.webp"
            className="side-link-img"
            alt="Ramblings"
            width={1492}
            height={1054}
          />
          <Image
            src="/covers/ramblings2mob.webp"
            className="side-link-img-mobile"
            alt="Ramblings"
            width={2072}
            height={759}
          />
          <span className="side-link-text">Ramblings</span>
        </Link>

        {/* Left sidebar — albums I & II */}
        <div className="album-sidebar">
          <nav className="shelf">
            {ALBUMS.slice(0, 2).map((al) => renderPick(al))}
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
                    className={`record-label${currentAlbum?.key === 'album-3' ? ' alt-label' : ''}`}
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
              <Image src="/covers/arm.webp" alt="" width={1024} height={683} priority />
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

          {/* Album III floated just above the turntable on desktop. Hidden on
              mobile, where it stays in the shelf row below. */}
          {renderPick(albumThree, 'above-turntable')}
        </div>

        {/* Right sidebar — albums III, IV & V as a row on mobile. On desktop III
            floats above the turntable and IV/V stack here, mirroring I & II —
            see the `above-turntable` / `shelf-triple` desktop rules in
            globals.css. */}
        <div className="album-sidebar">
          <nav className="shelf shelf-triple">
            {ALBUMS.slice(2, 5).map((al) => renderPick(al))}
          </nav>
        </div>

        <div className="side-link-cluster">
          {renderPick(albumThree, 'cluster-pick')}
          <Link href="/upcoming-gigs" className="side-link side-link-right">
            <Image
              src="/covers/gigs.webp"
              className="side-link-img"
              alt="Upcoming Gigs"
              width={716}
              height={1054}
            />
            <Image
              src="/covers/buttonhor.webp"
              className="side-link-img-mobile"
              alt="Upcoming Gigs"
              width={1504}
              height={499}
            />
            <span className="side-link-text">Upcoming Gigs</span>
          </Link>
          {renderPick(albumFive, 'cluster-pick')}
        </div>

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
