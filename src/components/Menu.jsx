import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { playStart, playClick } from '../utils/sound';

export default function Menu() {
  const startGame = useGameStore((s) => s.startGame);
  const highScores = useGameStore((s) => s.highScores);
  const [showScores, setShowScores] = useState(false);

  const handleStart = () => {
    playStart();
    setTimeout(startGame, 350);
  };

  return (
    <motion.div
      className="screen menu-screen d-flex align-items-center justify-content-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass-panel p-5 text-center">
        <div className="eyebrow mb-3">
          <span className="status-dot" /> SYSTEM IDLE · NEURAL LINK READY
        </div>
        <h1 className="title-mono mb-2">PROJECT</h1>
        <h1 className="title-glow mb-4">REACTOR MELTDOWN</h1>
        <p className="lead-mono mb-5">
          Quantum core requires manual stabilization.<br />
          Tap the active terminal before timeout. Don't fail.
        </p>

        <div className="d-flex flex-column gap-3 align-items-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon btn-neon-primary"
            onClick={handleStart}
          >
            ▶ START NEURAL LINK
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon"
            onClick={() => { playClick(); setShowScores((v) => !v); }}
          >
            ◆ HIGH SCORES
          </motion.button>
        </div>

        {showScores && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="scores-block mt-4"
          >
            <div className="eyebrow mb-2">TOP RECORDS</div>
            {highScores.length === 0 ? (
              <div className="text-muted-mono">— NO RECORDS —</div>
            ) : (
              <ol className="scores-list">
                {highScores.map((s, i) => (
                  <li key={i}><span>#{i + 1}</span><b>{s}</b></li>
                ))}
              </ol>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
