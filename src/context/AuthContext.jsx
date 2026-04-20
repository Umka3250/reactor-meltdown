import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db, githubProvider, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);

const getGitHubHandle = (user) => {
  const screenName = user?.reloadUserInfo?.screenName;
  if (screenName) {
    return screenName;
  }

  const githubProfile = user?.providerData?.find((item) => item.providerId === 'github.com');
  const name = githubProfile?.displayName || user?.displayName || '';
  if (name && !name.includes(' ')) {
    return name.replace(/^@/, '');
  }

  return '';
};

const getPlayerLabel = (user) => {
  const handle = getGitHubHandle(user);
  if (handle) {
    return `@${handle}`;
  }
  return user?.displayName || user?.email || 'GitHub pilot';
};

const mapAuthError = (error) => {
  if (!error?.code) {
    return 'GitHub sign-in failed. Try again.';
  }

  if (error.code === 'auth/popup-closed-by-user') {
    return 'GitHub sign-in was cancelled.';
  }

  if (error.code === 'auth/popup-blocked') {
    return 'Browser blocked the GitHub sign-in popup.';
  }

  if (error.code === 'auth/unauthorized-domain') {
    return 'This site is not authorized in Firebase Auth yet.';
  }

  return 'GitHub sign-in failed. Check Firebase Auth settings.';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(isFirebaseConfigured);
  const [leaderboardError, setLeaderboardError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
      setAuthError('');
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setLeaderboardLoading(false);
      return undefined;
    }

    const leaderboardQuery = query(
      collection(db, 'reactorLeaderboard'),
      orderBy('bestScore', 'desc'),
      limit(10)
    );

    return onSnapshot(
      leaderboardQuery,
      (snapshot) => {
        setLeaderboard(
          snapshot.docs.map((entry) => ({
            id: entry.id,
            ...entry.data(),
          }))
        );
        setLeaderboardLoading(false);
        setLeaderboardError('');
      },
      () => {
        setLeaderboard([]);
        setLeaderboardLoading(false);
        setLeaderboardError('Global leaderboard is unavailable right now.');
      }
    );
  }, []);

  const signInWithGitHub = useCallback(async () => {
    if (!isFirebaseConfigured || !auth || !githubProvider) {
      setAuthError('GitHub records are not configured yet.');
      return { ok: false, reason: 'not-configured' };
    }

    try {
      setIsSigningIn(true);
      setAuthError('');
      await signInWithPopup(auth, githubProvider);
      return { ok: true };
    } catch (error) {
      const message = mapAuthError(error);
      setAuthError(message);
      return { ok: false, reason: error?.code || 'auth-error', message };
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const signOutFromGitHub = useCallback(async () => {
    if (!auth) {
      return;
    }

    await signOut(auth);
  }, []);

  const saveScore = useCallback(async (score) => {
    if (!isFirebaseConfigured || !db) {
      return { saved: false, reason: 'not-configured' };
    }
    if (!user) {
      return { saved: false, reason: 'not-authenticated' };
    }

    const numericScore = Number(score) || 0;
    if (numericScore <= 0) {
      return { saved: false, reason: 'invalid-score' };
    }

    const playerRef = doc(db, 'reactorLeaderboard', user.uid);
    const playerDoc = await getDoc(playerRef);
    const existingBest = playerDoc.exists() ? Number(playerDoc.data().bestScore || 0) : 0;

    if (existingBest >= numericScore) {
      await setDoc(
        playerRef,
        {
          displayName: getPlayerLabel(user),
          githubHandle: getGitHubHandle(user),
          avatarUrl: user.photoURL || '',
          lastScore: numericScore,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { saved: false, reason: 'not-improved', bestScore: existingBest };
    }

    const githubHandle = getGitHubHandle(user);
    await setDoc(
      playerRef,
      {
        displayName: getPlayerLabel(user),
        githubHandle,
        profileUrl: githubHandle ? `https://github.com/${githubHandle}` : '',
        avatarUrl: user.photoURL || '',
        bestScore: numericScore,
        lastScore: numericScore,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return { saved: true, bestScore: numericScore };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        authError,
        authLoading,
        isFirebaseConfigured,
        isSigningIn,
        leaderboard,
        leaderboardError,
        leaderboardLoading,
        saveScore,
        signInWithGitHub,
        signOutFromGitHub,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
