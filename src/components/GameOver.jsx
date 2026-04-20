import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameStore } from '../store/gameStore';
import { playClick, playStart } from '../utils/sound';

export default function GameOver() {
  const score = useGameStore((s) => s.score);
  const highScores = useGameStore((s) => s.highScores);
  const startGame = useGameStore((s) => s.startGame);
  const goMenu = useGameStore((s) => s.goMenu);
  const isBest = highScores[0] === score && score > 0;
  const {
    authError,
    isFirebaseConfigured,
    isSigningIn,
    saveScore,
    signInWithGitHub,
    user,
  } = useAuth();
  const [saveState, setSaveState] = useState({ tone: 'muted', message: '' });

  useEffect(() => {
    let cancelled = false;

    const syncScore = async () => {
      if (!user || !isFirebaseConfigured || score <= 0) {
        return;
      }

      setSaveState({ tone: 'muted', message: 'Syncing record to GitHub leaderboard...' });
      const result = await saveScore(score);
      if (cancelled) {
        return;
      }

      if (result.saved) {
        setSaveState({ tone: 'success', message: `Online best saved: ${result.bestScore}` });
        return;
      }

      if (result.reason === 'not-improved') {
        setSaveState({
          tone: 'muted',
          message: `Online best remains ${result.bestScore}. Current run was lower.`,
        });
      }
    };

    syncScore().catch(() => {
      if (!cancelled) {
        setSaveState({ tone: 'danger', message: 'Failed to sync GitHub record.' });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isFirebaseConfigured, saveScore, score, user]);

  const handleGitHubSignIn = async () => {
    await signInWithGitHub();
  };

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

        {user ? (
          <div className={`auth-status auth-status--${saveState.tone || 'muted'} mt-4`}>
            {saveState.message || 'Online record sync is ready.'}
          </div>
        ) : (
          <div className="auth-status auth-status--muted mt-4">
            Sign in with GitHub to save this run to the online leaderboard.
          </div>
        )}

        {!user && (
          <div className="auth-actions auth-actions--center mt-3">
            <button
              type="button"
              className="btn-neon btn-neon-primary btn-neon--compact"
              onClick={handleGitHubSignIn}
              disabled={isSigningIn || !isFirebaseConfigured}
            >
              {isSigningIn ? 'CONNECTING...' : 'SIGN IN WITH GITHUB'}
            </button>
            <a
              className="text-link"
              href="https://github.com/signup"
              target="_blank"
              rel="noreferrer"
            >
              No GitHub account? Register here.
            </a>
          </div>
        )}

        {!isFirebaseConfigured && (
          <div className="auth-note mt-3">
            Online save is disabled until Firebase keys are configured for this site.
          </div>
        )}
        {authError && <div className="auth-status auth-status--danger mt-3">{authError}</div>}

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
