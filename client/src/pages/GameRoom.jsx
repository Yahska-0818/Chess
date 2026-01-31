import { useParams } from 'react-router-dom';
import useSocketGame from '../hooks/useSocketGame';
import GameScreen from '../components/GameScreen';

export default function GameRoom() {
  const { id } = useParams();
  const gameState = useSocketGame(id);
  return <GameScreen {...gameState} gameId={id} />;
}