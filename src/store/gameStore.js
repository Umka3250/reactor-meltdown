import { create } from 'zustand';

const GRID_SIZE = 12;
const INITIAL_TIME = 2000;
const MIN_TIME = 600;
const TIME_DECAY = 35;

const NEON_PALETTE = [
  { glow: '#00ff9d', accent: '#00ffd5' },
  { glow: '#00d9ff', accent: '#0080ff' },
  { glow: '#bd00ff', accent: '#ff00d4' },
  { glow: '#ffea00', accent: '#ff8800' },
  { glow: '#ff0066', accent: '#ff0033' },
];

const pickRandom = (exclude) => {
  let i;
  do { i = Math.floor(Math.random() * GRID_SIZE); } while (i === exclude);
  return i;
};

const normalizeHighScores = (value) => {
  const scores = Array.isArray(value) ? value : [];
  const best = scores
    .map((score) => Number(score) || 0)
    .filter((score) => score > 0)
    .sort((a, b) => b - a)[0];

  return best ? [best] : [];
};

const loadHighScores = () => {
  try {
    return normalizeHighScores(JSON.parse(localStorage.getItem('rm_scores') || '[]'));
  } catch {
    return [];
  }
};

export const useGameStore = create((set, get) => ({
  screen: 'menu',           // 'menu' | 'game' | 'over'
  score: 0,
  active: -1,               // active terminal index
  timeLimit: INITIAL_TIME,  // current per-step ms allowance
  paletteIndex: 0,
  glitch: false,
  highScores: loadHighScores(),
  gridSize: GRID_SIZE,

  goMenu: () => set({ screen: 'menu' }),

  startGame: () => {
    const first = Math.floor(Math.random() * GRID_SIZE);
    set({
      screen: 'game',
      score: 0,
      active: first,
      timeLimit: INITIAL_TIME,
      paletteIndex: 0,
      glitch: false,
    });
  },

  hitTerminal: (idx) => {
    const { active, score, timeLimit, paletteIndex } = get();
    if (idx !== active) {
      get().meltdown();
      return false;
    }
    const newScore = score + 1;
    const newPalette = newScore % 10 === 0
      ? (paletteIndex + 1) % NEON_PALETTE.length
      : paletteIndex;
    const triggerGlitch = newScore > 0 && newScore % 10 === 0;
    set({
      score: newScore,
      active: pickRandom(idx),
      timeLimit: Math.max(MIN_TIME, timeLimit - TIME_DECAY),
      paletteIndex: newPalette,
      glitch: triggerGlitch,
    });
    if (triggerGlitch) {
      setTimeout(() => set({ glitch: false }), 400);
    }
    return true;
  },

  meltdown: () => {
    const { score, highScores } = get();
    const next = normalizeHighScores([...highScores, score]);
    localStorage.setItem('rm_scores', JSON.stringify(next));
    set({ screen: 'over', highScores: next, active: -1 });
  },

  getPalette: () => NEON_PALETTE[get().paletteIndex],
}));

export { NEON_PALETTE };
