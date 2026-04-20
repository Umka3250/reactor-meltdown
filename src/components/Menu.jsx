import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameStore } from '../store/gameStore';
import { playStart, playClick } from '../utils/sound';

export default function Menu() {
  const startGame = useGameStore((s) => s.startGame);
  const highScores = useGameStore((s) => s.highScores);
  const [showScores, setShowScores] = useState(false);
  const {
    authError,
    authLoading,
    isFirebaseConfigured,
    isSigningIn,
    leaderboard,
    leaderboardError,
    leaderboardLoading,
    signInWithGitHub,
    signOutFromGitHub,
    user,
  } = useAuth();

  const accountLabel = user?.reloadUserInfo?.screenName
    ? `@${user.reloadUserInfo.screenName}`
    : user?.displayName || user?.email || 'GitHub pilot';

  const handleStart = () => {
    playStart();
    setTimeout(startGame, 350);
  };

  const handleGitHubSignIn = async () => {
    playClick();
    await signInWithGitHub();
  };

  const handleGitHubSignOut = async () => {
    playClick();
    await signOutFromGitHub();
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

        <div className="account-panel">
          <div className="eyebrow mb-2">GITHUB RECORDS</div>
          {authLoading ? (
            <div className="auth-status auth-status--muted">Checking GitHub session...</div>
          ) : user ? (
            <>
              <div className="auth-status auth-status--success">
                Online save is enabled for <b>{accountLabel}</b>.
              </div>
              <div className="auth-actions">
                <button
                  type="button"
                  className="btn-neon btn-neon--ghost btn-neon--compact"
                  onClick={handleGitHubSignOut}
                >
                  SIGN OUT
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="auth-status auth-status--muted">
                Sign in with GitHub to save your best score in the global leaderboard.
              </div>
              <div className="auth-actions">
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
            </>
          )}

          {!isFirebaseConfigured && (
            <div className="auth-note">
              Online save is coded, but Firebase keys are not configured yet.
            </div>
          )}
          {authError && <div className="auth-status auth-status--danger">{authError}</div>}
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

            <div className="score-card mt-3">
              <div className="eyebrow mb-2">GITHUB LEADERBOARD</div>
              {leaderboardLoading ? (
                <div className="text-muted-mono">LOADING ONLINE RECORDS...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-muted-mono">NO ONLINE RECORDS YET</div>
              ) : (
                <ol className="scores-list">
                  {leaderboard.map((entry, index) => {
                    const label = entry.displayName || 'GitHub pilot';
                    return (
                      <li key={entry.id}>
                        <span>
                          #{index + 1}{' '}
                          {entry.profileUrl ? (
                            <a
                              className="text-link text-link--inline"
                              href={entry.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {label}
                            </a>
                          ) : (
                            label
                          )}
                        </span>
                        <b>{entry.bestScore || 0}</b>
                      </li>
                    );
                  })}
                </ol>
              )}
              {leaderboardError && (
                <div className="auth-status auth-status--danger">{leaderboardError}</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
