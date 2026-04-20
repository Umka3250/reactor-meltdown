import { memo } from 'react';

const PAD = (n) => String(n).padStart(2, '0');

function Terminal({ index, isActive, onHit }) {
  return (
    <button
      type="button"
      className={`terminal ${isActive ? 'terminal--active' : ''}`}
      onClick={() => onHit(index)}
      aria-label={`Terminal ${PAD(index + 1)}`}
    >
      <div className="terminal__id">T-{PAD(index + 1)}</div>
      <div className="terminal__core">
        <div className="terminal__ring" />
        <div className="terminal__dot" />
      </div>
      <div className="terminal__status">
        {isActive ? 'INPUT REQ' : 'STANDBY'}
      </div>
    </button>
  );
}

// Memoize so only the active/previously-active terminals re-render on state change
export default memo(Terminal, (prev, next) =>
  prev.isActive === next.isActive && prev.index === next.index
);
