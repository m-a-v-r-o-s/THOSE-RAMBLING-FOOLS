import { useAudio } from './AudioProvider';

// Top letterbox bar on every page: logo, what's playing, and a play/pause
// that works from any page since the music carries across navigation.
export default function TopBar({ home = false }: { home?: boolean }) {
  const { current, phase, speed, togglePlay } = useAudio();
  const logo = (
    <img className="logo" src="/covers/newlogo.webp" alt="Those Rambling Fools" width={1290} height={199} decoding="async" />
  );
  const sounding = phase === 'playing' || phase === 'loading';

  return (
    <header className="topbar">
      {home ? logo : <a href="/" aria-label="Back to the turntable">{logo}</a>}
      <div className="now-showing" aria-live="polite">
        <span className="label">{current ? 'Now spinning' : 'Original music from Kos, Greece'}</span>
        {current && (
          <span className={`title${current.single ? ' mule' : ''}`}>
            {current.single ? `Mule · ${current.title}` : current.key === 'album-1' ? 'I · Those Rambling Fools' : current.title}
          </span>
        )}
      </div>
      {current && (
        <>
          <span className="rpm">{speed === 45 ? '45' : '33⅓'} rpm</span>
          <button type="button" className="bar-btn" onClick={togglePlay} aria-label={sounding ? 'Stop' : 'Play'}>
            {sounding ? '❚❚' : '▶'}
          </button>
        </>
      )}
    </header>
  );
}
