import useLocalGame from '../hooks/useLocalGame';
import GameScreen from '../components/GameScreen';

export default function LocalGame() {
  const gameState = useLocalGame();
  return <GameScreen {...gameState} role={gameState.turn} />;
}