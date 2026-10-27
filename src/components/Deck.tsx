import { useEffect, useRef, type CSSProperties } from 'react';
import type { Album } from '../albums';
import { useAudio, type Speed } from './AudioProvider';
import { sfx } from './sfx';

// Geometry in the deck photo's own pixels (playeronlynew.webp, 1200x936).
// The old arm image was 347px from pivot to needle against 575px from pivot to
// spindle, so it could only ever reach 42% of the way in. This arm is drawn to
// the photo's printed bearing and arm rest, with a real arm's proportions: its
// effective length is the pivot-to-spindle distance plus ~3% overhang.
const PIVOT = { x: 1002, y: 227 };
const SPINDLE = { x: 477.6, y: 462.4 }; // the .platter centre, 39.8% / 49.4%
const D = Math.hypot(SPINDLE.x - PIVOT.x, SPINDLE.y - PIVOT.y);
const L = 592;
const TO_SPINDLE = (Math.atan2(SPINDLE.y - PIVOT.y, SPINDLE.x - PIVOT.x) * 180) / Math.PI;
const REST = 90; // straight down through the arm clip
// Groove radii in deck px: lead-in to run-out, just outside the label.
const GROOVES = { lp: [398, 145], single: [230, 124] };

// Arm angle that puts the needle at radius r from the spindle (law of cosines).
function angleFor(r: number) {
  const cos = (D * D + L * L - r * r) / (2 * D * L);
  return TO_SPINDLE - (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}
function needleAngle(record: Album, frac: number) {
  const [outer, inner] = record.single ? GROOVES.single : GROOVES.lp;
  return angleFor(outer - (outer - inner) * Math.max(0, Math.min(1, frac)));
}

// Headshell: 78px long, angled 22° toward the spindle like a real offset arm.
const HS = 78;
const OFFSET = (22 * Math.PI) / 180;
const T = { x: L - HS * Math.cos(OFFSET), y: -HS * Math.sin(OFFSET) };
const TUBE_DIR = Math.atan2(T.y, T.x);
const TUBE_START = { x: 56 * Math.cos(TUBE_DIR), y: 56 * Math.sin(TUBE_DIR) };

function Tonearm({ deg, follow }: { deg: number; follow: boolean }) {
  return (
    <svg className="tonearm" viewBox="0 0 1200 936" aria-hidden="true">
      <defs>
        <filter id="arm-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="10" dy="14" stdDeviation="7" floodColor="#000" floodOpacity="0.45" />
        </filter>
        <linearGradient id="shell" x1="0" y1="-13" x2="0" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f4f4f2" />
          <stop offset="0.55" stopColor="#c9c9c6" />
          <stop offset="1" stopColor="#8d8d8a" />
        </linearGradient>
      </defs>
      {/* Shadow on the unrotated group so the light stays top-left as the arm swings. */}
      <g filter="url(#arm-shadow)">
        <g className={`tonearm-arm${follow ? ' follow' : ''}`} style={{ transform: `rotate(${deg}deg)` }}>
          <g transform={`translate(${PIVOT.x} ${PIVOT.y})`}>
            <line x1={TUBE_START.x} y1={TUBE_START.y} x2={T.x} y2={T.y} stroke="#3e3e3c" strokeWidth="12" strokeLinecap="round" />
            <line x1={TUBE_START.x} y1={TUBE_START.y} x2={T.x} y2={T.y} stroke="#bdbdba" strokeWidth="9" strokeLinecap="round" />
            <line x1={TUBE_START.x} y1={TUBE_START.y - 2} x2={T.x} y2={T.y - 2} stroke="#fbfbf8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={TUBE_START.x} cy={TUBE_START.y} r="9" fill="#232322" />
            <g transform={`translate(${T.x} ${T.y}) rotate(22)`}>
              <rect x="-10" y="-7" width="16" height="14" rx="3" fill="#2c2c2b" />
              <rect x="-8" y="-7" width="2.5" height="14" fill="#6d6d6a" />
              <path d="M4 -10 L78 -13 L84 -8 L84 8 L78 13 L4 10 Z" fill="url(#shell)" stroke="#6f6f6c" strokeWidth="1" />
              <path d="M62 -12 Q66 -26 60 -38" fill="none" stroke="#d7d7d4" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="28" y="-9" width="50" height="18" rx="2.5" fill="#161616" />
              <circle cx="44" cy="-5" r="2.2" fill="#bdbdba" />
              <circle cx="44" cy="5" r="2.2" fill="#bdbdba" />
              <circle cx={HS} cy="0" r="1.8" fill="#9a9a96" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

// Degrees per second at each speed: 33⅓ rpm is 200°/s.
const DEG_PER_S: Record<Speed, number> = { 33: 200, 45: 270 };

export default function Deck() {
  const { current, phase, speed, time, duration, hintDismissed, togglePlay, setSpeed } = useAudio();
  const spinRef = useRef<HTMLDivElement>(null);
  const motor = phase === 'loading' || phase === 'playing';
  const target = useRef(0);
  const loop = useRef<() => void>(() => {});

  // The platter is driven from JS so it winds up and down like the motor,
  // and the loop sleeps once it has come to rest.
  useEffect(() => {
    let raf = 0;
    let a = 0;
    let v = 0;
    let last = 0;
    const step = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      const goal = target.current;
      v += (goal - v) * Math.min(1, dt * (goal > v ? 2.6 : 1.6));
      a = (a + v * dt) % 360;
      if (spinRef.current) spinRef.current.style.transform = `rotate(${a}deg)`;
      if (goal === 0 && v < 0.5) {
        raf = 0;
        last = 0;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    loop.current = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    target.current = motor ? DEG_PER_S[speed] : 0;
    loop.current();
  }, [motor, speed]);

  const onRecord = phase === 'loading' || phase === 'playing' || phase === 'stopped';
  const armDeg = current && onRecord ? needleAngle(current, duration ? time / duration : 0) : REST;

  return (
    <div className={`deck${current?.single ? ' is-single' : ''}`}>
      <img
        className="deck-img"
        src="/covers/playeronlynew.webp"
        alt="Silver direct-drive turntable"
        width={1200}
        height={936}
        fetchPriority="high"
        decoding="async"
      />
      <div className="mat" />
      <div className="platter">
        <div className="spin" ref={spinRef}>
          {current && <RecordDisc key={current.key} record={current} />}
        </div>
        {/* The photo's own spindle, laid back over the record so it pokes through the hole. */}
        <div className="spindle" />
      </div>
      <Tonearm deg={armDeg} follow={phase === 'playing'} />
      <button
        type="button"
        className={`deck-btn start-stop${motor ? ' on' : ''}`}
        onClick={() => {
          sfx.startStop();
          togglePlay();
        }}
        aria-label={current ? (motor ? 'Stop' : 'Start') : 'Start a random album'}
        title="Start / Stop"
      />
      {([33, 45] as const).map((s) => (
        <button
          key={s}
          type="button"
          className={`deck-btn speed speed-${s}${current && speed === s ? ' on' : ''}`}
          onClick={() => {
            sfx.speed();
            setSpeed(s);
          }}
          aria-label={s === 33 ? '33⅓ rpm' : '45 rpm'}
          aria-pressed={speed === s}
        />
      ))}
      <span className={`spin-hint${hintDismissed ? ' hidden' : ''}`} aria-hidden="true">
        Press to spin
      </span>
    </div>
  );
}

function RecordDisc({ record }: { record: Album }) {
  return (
    <div
      className={`disc${record.single ? ' disc-single' : ''}`}
      style={record.vinyl ? ({ '--vinyl': record.vinyl } as CSSProperties) : undefined}
    >
      <div
        className={`disc-label${record.label ? ' alt-label' : ''}`}
        style={{ backgroundImage: `url('${record.label ?? record.art}')` }}
      />
    </div>
  );
}
