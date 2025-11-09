import { useCallback, useEffect, useState } from "react";
import gameService from "../services/gameService";

export default function useChessGame(options = {}) {
  const { roomCode = null, playerColor = null } = options;

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [legalMoves, setLegalMoves] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [promotionData, setPromotionData] = useState(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    gameService
      .createGame()
      .then((initial) => {
        if (mounted) {
          setGame(initial);
          setLoading(false);
        }
      })
      .catch((e) => { console.error(e); setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const resetGame = useCallback(async () => {
    setLoading(true);
    setLegalMoves([]); setSelectedPiece(null); setPromotionData(null); setCurrentMoveIndex(null);
    const newGame = await gameService.createGame();
    setGame(newGame);
    setLoading(false);
  }, []);

  const handleSquareClick = useCallback(async (row, col) => {
    if (!game || game.winner || promotionData) return;

    try {
      if (selectedPiece) {
        const [fr, fc] = selectedPiece;
        const isLegal = legalMoves.some(([r, c]) => r === row && c === col);

        if (isLegal && playerColor && game.turn === playerColor) {
          const newGameState = await gameService.makeMove(
            game._id,
            [fr, fc],
            [row, col],
            roomCode,
            playerColor
          );

          if (newGameState.status === "awaiting_promotion") {
            setPromotionData(newGameState.promotionData);
            setGame(newGameState);
          } else {
            setGame(newGameState);
          }

          setSelectedPiece(null);
          setLegalMoves([]);
          setCurrentMoveIndex(newGameState.moveHistory.length - 1);
        } else if (fr === row && fc === col) {
          setSelectedPiece(null);
          setLegalMoves([]);
        } else {
          const piece = game.board[row][col];
          if (piece && piece.color === playerColor) {
            const moves = await gameService.getLegalMoves(game._id, row, col);
            setSelectedPiece([row, col]);
            setLegalMoves(moves);
          } else {
            setSelectedPiece(null);
            setLegalMoves([]);
          }
        }
      } else {
        const piece = game.board[row][col];
        if (piece && piece.color === playerColor) {
          const moves = await gameService.getLegalMoves(game._id, row, col);
          setSelectedPiece([row, col]);
          setLegalMoves(moves);
        }
      }
    } catch (e) {
      console.error("Error handling move:", e);
      setSelectedPiece(null); setLegalMoves([]);
    }
  }, [game, legalMoves, promotionData, selectedPiece, roomCode, playerColor]);

  const handlePromotion = useCallback(async (pieceName) => {
    if (!promotionData || !game) return;
    try {
      const newGameState = await gameService.promotePawn(
        game._id,
        promotionData.from,
        promotionData.to,
        pieceName,
        roomCode,
        playerColor
      );
      setGame(newGameState);
      setPromotionData(null);
      setCurrentMoveIndex(newGameState.moveHistory.length - 1);
    } catch (e) {
      console.error("Error promoting pawn:", e);
    }
  }, [game, promotionData, roomCode, playerColor]);

  const handleJumpToMove = useCallback(async (moveIndex) => {
    if (!game) return;
    try {
      if (typeof gameService.getGameSnapshotAtMove === "function") {
        const snapshot = await gameService.getGameSnapshotAtMove(game._id, moveIndex);
        if (snapshot) {
          setGame(snapshot);
          setCurrentMoveIndex(moveIndex);
          setSelectedPiece(null);
          setLegalMoves([]);
          return;
        }
      }
      setCurrentMoveIndex(moveIndex);
      alert("Jump not supported by server — only highlighting the move locally.");
    } catch (e) {
      console.error("Error jumping to move:", e);
    }
  }, [game]);

  const applyExternalState = useCallback((nextState) => {
    if (!nextState) return;
    setGame(nextState);
    setSelectedPiece(null);
    setLegalMoves([]);
    setPromotionData(null);
    setCurrentMoveIndex(nextState.moveHistory?.length ? nextState.moveHistory.length - 1 : null);
  }, []);

  return {
    game, loading, legalMoves, selectedPiece, promotionData, currentMoveIndex,
    resetGame, handleSquareClick, handlePromotion, handleJumpToMove,
    applyExternalState,
  };
}
