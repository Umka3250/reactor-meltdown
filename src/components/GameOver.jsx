import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { playClick, playStart } from '../utils/sound';

export default function GameOver() {
  const score = useGameStore((s) => s.score);
  const highScores = useGameStore((s) => s.highScores);
  const startGame = useGameStore((s) => s.startGame);
  const goMenu = useGameStore((s) => s.goMenu);
  const isBest = highScores[0] === score && score > 0;

  return (
    <motion.div
      className="screen over-screen d-flex align-items-center justify-content-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="over-overlay" />
      <motion.div
        className="glass-panel glass-panel--danger p-5 text-center"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="eyebrow eyebrow--danger mb-3 danger-blink">
          <span className="status-dot status-dot--red" /> SYSTEM CRITICAL
        </div>
        <h1 className="title-mono mb-1">MELTDOWN</h1>
        <h2 className="title-danger mb-4">IMMINENT.</h2>

        <div className="final-score">
          <div className="eyebrow">FINAL STABILITY</div>
          <div className="final-score__value">{String(score).padStart(4, '0')}</div>
          {isBest && <div className="best-badge">★ NEW HIGH SCORE</div>}
        </div>

        <div className="d-flex flex-column gap-3 align-items-center mt-4">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon btn-neon-primary"
            onClick={() => { playStart(); setTimeout(startGame, 250); }}
          >
            ↻ REBOOT SYSTEM
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon btn-neon--ghost"
            onClick={() => { playClick(); goMenu(); }}
          >
            ◂ MAIN MENU
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
