import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Chess } from 'chess.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3003';

export default function useSocketGame(gameId) {
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [role, setRole] = useState(null); 
  const [turn, setTurn] = useState('w');
  const [winner, setWinner] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('join_game', gameId);

    socketRef.current.on('connect', () => setIsConnected(true));

    socketRef.current.on('game_state', (state) => {
      const newGame = new Chess(state.fen);
      setChess(newGame);
      setFen(newGame.fen());
      setTurn(newGame.turn());
      setRole(state.role);
      setIsGameOver(state.isGameOver);
      setWinner(state.winner);
    });

    socketRef.current.on('board_update', (update) => {
      const newGame = new Chess(update.fen);
      setChess(newGame);
      setFen(update.fen);
      setTurn(update.turn);
      setIsGameOver(update.isGameOver);
      setWinner(update.winner);
    });

    return () => socketRef.current.disconnect();
  }, [gameId]);

  const makeMove = useCallback((from, to, promotion = 'q') => {
    const tempGame = new Chess(chess.fen());
    if (role && role !== 'spectator' && role !== tempGame.turn()) return false;

    try {
      const move = tempGame.move({ from, to, promotion });
      if (move) {
        setChess(tempGame);
        setFen(tempGame.fen());
        setTurn(tempGame.turn());
        socketRef.current.emit('make_move', { gameId, from, to, promotion });
        return true;
      }
    // eslint-disable-next-line no-unused-vars
    } catch (e) { return false; }
    return false;
  }, [chess, role, gameId]);

  return { chess, fen, turn, role, winner, isGameOver, isConnected, makeMove };
}