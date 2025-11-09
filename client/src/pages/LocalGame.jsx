import useChessGame from "../hooks/useChessGame";
import GameScreen from "../components/GameScreen";

export default function LocalGame() {
  const state = useChessGame();
  return <GameScreen {...state} />;
}