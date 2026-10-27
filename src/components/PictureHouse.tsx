import { useEffect, useState, type CSSProperties } from 'react';
import { ALBUMS, SINGLES, type Album } from '../albums';
import { useAudio } from './AudioProvider';
import Deck from './Deck';
import { sfx } from './sfx';

const fmt = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';

const frameName = (r: Album) => (r.single ? r.title : r.key === 'album-1' ? 'I' : r.title);

// The home page's cinema: the deck in one light, the room tinted by the sleeve
// on the platter, a title card per record, and the records as a film strip in
// the bottom letterbox bar.
export default function PictureHouse() {
  const { current, phase, speed, time, duration, volume, pickCount, pick, togglePlay, seek, seekTo, setSpeed, setVolume } =
    useAudio();

  // The last two sleeves stay mounted so one fades out as the next fades in.
  const [backdrops, setBackdrops] = useState<Album[]>([]);
  useEffect(() => {
    if (current) setBackdrops((b) => [...b.filter((r) => r.key !== current.key), current].slice(-2));
  }, [current]);

  const sounding = phase === 'playing' || phase === 'loading';
  const style = { '--tint': current?.tint ?? '#fff3e0' } as CSSProperties;

  const frame = (r: Album) => (
    <button
      key={r.key}
      type="button"
      className={`frame${r.single ? ' frame-single' : ''}${current?.key === r.key ? ' on' : ''}`}
      onClick={() => pick(r)}
      aria-pressed={current?.key === r.key}
      aria-label={`${r.single ? 'Mule single' : 'Album'} ${r.key === 'album-1' ? 'I, Those Rambling Fools' : r.title}${current?.key === r.key ? ', playing. Press to stop' : ''}`}
    >
      <img src={r.art} alt="" width={160} height={160} loading="lazy" decoding="async" />
      <span>{frameName(r)}</span>
    </button>
  );

  return (
    <section className={`cinema${current?.single ? ' is-mule' : ''}`} style={style} aria-label="Turntable">
      <div className="screen">
        {backdrops.map((r) => (
          <div
            key={r.key}
            className={`backdrop${r.key === current?.key ? ' on' : ''}`}
            style={{ backgroundImage: `url('${r.art}')` }}
          />
        ))}
        <div className="spot" />
        <div className="vignette" />
        <div className="grain" />

        <div className="deck-wrap">
          <Deck />
        </div>

        <div className="intro" aria-hidden="true">
          <img src="/covers/newlogo.webp" alt="" width={1290} height={199} />
          <span>Original music from Kos, Greece</span>
        </div>

        {current && pickCount > 0 && (
          <div key={pickCount} className="title-card" aria-hidden="true">
            <span className="k">{current.single ? 'Intermission' : 'Those Rambling Fools present'}</span>
            <span className="h">{current.single ? 'Mule' : current.key === 'album-1' ? 'I' : current.title}</span>
            <span className="s">
              {current.single
                ? `${current.title} · 7" · 45 rpm · a Christos P. project`
                : `${current.key === 'album-1' ? 'Those Rambling Fools · ' : ''}LP · 33⅓ · ${current.length}`}
            </span>
          </div>
        )}
      </div>

      <div className="bottombar">
        <div className="transport">
          <div className="transport-btns">
            <button type="button" className="bar-btn" onClick={() => seek(-60)} disabled={!current} aria-label="Back one minute">
              ◀◀
            </button>
            <button type="button" className="bar-btn bar-play" onClick={togglePlay} aria-label={sounding ? 'Stop' : 'Play'}>
              {sounding ? '❚❚' : '▶'}
            </button>
            <button type="button" className="bar-btn" onClick={() => seek(60)} disabled={!current} aria-label="Forward one minute">
              ▶▶
            </button>
          </div>
          <span className="time time-cur">{fmt(time)}</span>
          <input
            className="scrub"
            type="range"
            min={0}
            max={duration || 1}
            step={1}
            value={Math.min(time, duration || 1)}
            onChange={(e) => seekTo(Number(e.target.value))}
            disabled={!current}
            aria-label="Position"
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
            style={{ '--p': `${duration ? (time / duration) * 100 : 0}%` } as CSSProperties}
          />
          <span className="time time-dur">{current ? fmt(duration) : '0:00'}</span>
          <div className="speed-toggle" role="group" aria-label="Speed">
            {([33, 45] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={current && speed === s ? 'on' : ''}
                onClick={() => {
                  sfx.speed();
                  setSpeed(s);
                }}
                aria-pressed={speed === s}
                disabled={!current}
              >
                {s === 33 ? '33⅓' : '45'}
              </button>
            ))}
          </div>
          <input
            className="volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            style={{ '--p': `${volume * 100}%` } as CSSProperties}
          />
        </div>

        <div className="reel" role="group" aria-label="Records">
          {ALBUMS.map(frame)}
          <span className="intermission">
            <img src="/covers/mule-m.webp" alt="" width={240} height={219} loading="lazy" />
            Intermission
          </span>
          {SINGLES.map(frame)}
        </div>
      </div>
    </section>
  );
}
