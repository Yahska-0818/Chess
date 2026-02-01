import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';

export default function useLocalGame() {
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [turn, setTurn] = useState('w');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [moveList, setMoveList] = useState([]);

  const makeMove = useCallback((from, to, promotion = 'q') => {
    const tempGame = new Chess(chess.fen());
    try {
      const move = tempGame.move({ from, to, promotion });
      if (move) {
        setChess(tempGame);
        setFen(tempGame.fen());
        setTurn(tempGame.turn());
        
        const newMove = {
          from: move.from,
          to: move.to,
          san: move.san,
          color: move.color
        };
        setMoveList((prev) => [...prev, newMove]);

        if (tempGame.isGameOver()) {
          setIsGameOver(true);
          if (tempGame.isCheckmate()) setWinner(tempGame.turn() === 'w' ? 'b' : 'w');
          else setWinner('draw');
        }
        return true;
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) { return false; }
    return false;
  }, [chess]);

  const resetGame = () => {
    const newGame = new Chess();
    setChess(newGame);
    setFen(newGame.fen());
    setTurn('w');
    setIsGameOver(false);
    setWinner(null);
    setMoveList([]);
  };

  return { 
    chess, fen, turn, role: null, winner, isGameOver, 
    isConnected: true, makeMove, resetGame,
    moveList
  };
}