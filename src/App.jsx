import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import Menu from './components/Menu';
import Game from './components/Game';
import GameOver from './components/GameOver';
import Backdrop from './components/Backdrop';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const palette = useGameStore((s) => s.getPalette());

  return (
    <div
      className="app-shell"
      style={{
        '--neon': palette.glow,
        '--neon-2': palette.accent,
      }}
    >
      <Backdrop />
      <AnimatePresence mode="wait">
        {screen === 'menu' && <Menu key="menu" />}
        {screen === 'game' && <Game key="game" />}
        {screen === 'over' && <GameOver key="over" />}
      </AnimatePresence>
    </div>
  );
}
