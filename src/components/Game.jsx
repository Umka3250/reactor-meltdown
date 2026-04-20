import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { playSuccess, playError, playMeltdown, playWarn } from '../utils/sound';
import Terminal from './Terminal';

export default function Game() {
  const score = useGameStore((s) => s.score);
  const active = useGameStore((s) => s.active);
  const timeLimit = useGameStore((s) => s.timeLimit);
  const gridSize = useGameStore((s) => s.gridSize);
  const glitch = useGameStore((s) => s.glitch);
  const hitTerminal = useGameStore((s) => s.hitTerminal);
  const meltdown = useGameStore((s) => s.meltdown);

  // Local timer state — driven by rAF, decoupled from Zustand to avoid re-rendering terminals
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const startRef = useRef(performance.now());
  const limitRef = useRef(timeLimit);
  const warnedRef = useRef(false);

  // Reset timer whenever active terminal or limit changes
  useEffect(() => {
    startRef.current = performance.now();
    limitRef.current = timeLimit;
    warnedRef.current = false;
    setTimeLeft(timeLimit);
  }, [active, timeLimit]);

  // The Game Loop — single rAF, no per-tick Zustand writes
  useEffect(() => {
    let raf;
    const loop = () => {
      const elapsed = performance.now() - startRef.current;
      const remaining = limitRef.current - elapsed;
      if (remaining <= 0) {
        playMeltdown();
        meltdown();
        return;
      }
      // warn beep at 30% remaining
      if (!warnedRef.current && remaining < limitRef.current * 0.3) {
        warnedRef.current = true;
        playWarn();
      }
      setTimeLeft(remaining);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, meltdown]);

  const onHit = useCallback((idx) => {
    const ok = hitTerminal(idx);
    if (ok) playSuccess();
    else playError();
  }, [hitTerminal]);

  const pct = Math.max(0, (timeLeft / limitRef.current) * 100);
  const barColor = pct > 60 ? 'safe' : pct > 30 ? 'warn' : 'danger';

  return (
    <motion.div
      className={`screen game-screen ${glitch ? 'glitch' : ''}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.35 }}
    >
      <div className="hud">
        <div className="hud__row">
          <div className="hud__cell">
            <div className="hud__label">STABILITY</div>
            <div className="hud__value title-glow">{String(score).padStart(4, '0')}</div>
          </div>
          <div className="hud__cell hud__cell--mid">
            <div className="hud__label">SECTOR · OMEGA-7 · CORE</div>
            <div className="hud__id">REACTOR ID #QR-9921 · {Math.round(pct)}%</div>
          </div>
          <div className="hud__cell hud__cell--right">
            <div className="hud__label">REACTION SPEED</div>
            <div className="hud__value title-glow">{(timeLimit / 1000).toFixed(2)}s</div>
          </div>
        </div>
        <div className="hud__bar">
          <div className={`hud__bar-fill hud__bar-fill--${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="hud__corner danger-blink">⚠ CORE TEMP CRITICAL</div>
      </div>

      <div className="grid-wrap">
        <div className="terminal-grid">
          {Array.from({ length: gridSize }).map((_, i) => (
            <Terminal
              key={i}
              index={i}
              isActive={i === active}
              onHit={onHit}
            />
          ))}
        </div>
      </div>

      <div className="ticker">
        <span>QUANTUM_SYNC: OK</span>
        <span>NEURAL_LINK: ACTIVE</span>
        <span>CONTAINMENT: {pct > 30 ? 'NOMINAL' : 'BREACH IMMINENT'}</span>
        <span>SCORE: {score}</span>
      </div>
    </motion.div>
  );
}
