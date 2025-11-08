import React from "react";
import { useState, useEffect } from "react";
import gameService from './services/gameService';
import ChessBoard from "./components/Chessboard";
import MoveHistory from "./components/MoveHistoy";
import { pieceIcons } from "./pieces";
import CapturedPieces from "./components/CapturedPieces";

const App = () => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [legalMoves, setLegalMoves] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [promotionData, setPromotionData] = useState(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    gameService.createGame()
      .then(initialGameState => {
        if (!mounted) return;
        setGame(initialGameState);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error creating game:", err);
        setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const resetGame = async () => {
    setLoading(true);
    setLegalMoves([]);
    setSelectedPiece(null);
    setPromotionData(null);
    setCurrentMoveIndex(null);
    const newGame = await gameService.createGame();
    setGame(newGame);
    setLoading(false);
  };

  const handleSquareClick = async (row, col) => {
    if (!game) return;
    if (game.winner || promotionData) return;

    try {
      if (selectedPiece) {
        const [fromRow, fromCol] = selectedPiece;
        const isLegal = legalMoves.some(([r, c]) => r === row && c === col);

        if (isLegal) {
          const newGameState = await gameService.makeMove(game._id, [fromRow, fromCol], [row, col]);

          if (newGameState.status === 'awaiting_promotion') {
            setPromotionData(newGameState.promotionData);
            setGame(newGameState);
          } else {
            setGame(newGameState);
          }

          setSelectedPiece(null);
          setLegalMoves([]);
          setCurrentMoveIndex(newGameState.moveHistory.length - 1);

        } else if (fromRow === row && fromCol === col) {
          setSelectedPiece(null);
          setLegalMoves([]);
        } else {
          const piece = game.board[row][col];
          if (piece && piece.color === game.turn) {
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
        if (piece && piece.color === game.turn) {
          const moves = await gameService.getLegalMoves(game._id, row, col);
          setSelectedPiece([row, col]);
          setLegalMoves(moves);
        }
      }
    } catch (error) {
      console.error("Error handling move:", error);
      setSelectedPiece(null);
      setLegalMoves([]);
    }
  };

  const handlePromotion = async (pieceName) => {
    if (!promotionData || !game) return;

    try {
      const newGameState = await gameService.promotePawn(
        game._id,
        promotionData.from,
        promotionData.to,
        pieceName
      );
      setGame(newGameState);
      setPromotionData(null);
      setCurrentMoveIndex(newGameState.moveHistory.length - 1);
    } catch (error) {
      console.error("Error promoting pawn:", error);
    }
  };

  const handleJumpToMove = async (moveIndex) => {
    if (!game) return;

    try {
      if (typeof gameService.getGameSnapshotAtMove === 'function') {
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
      alert('Jump not supported by server — only highlighting the move locally.');
    } catch (err) {
      console.error('Error jumping to move:', err);
    }
  };

  if (loading) {
    return <div className="relative min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 text-white flex justify-center items-center text-2xl">Loading Game...</div>;
  }

  if (!game) {
    return <div className="relative min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 text-white flex justify-center items-center text-2xl">Error loading game.</div>;
  }

  const promotionPieces = ['queen', 'rook', 'bishop', 'knight'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 text-neutral-100 p-6">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold">ChessLab</div>
          <div className="text-sm text-neutral-400">Play • Analyze • Learn</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-300">Turn: <span className="font-semibold capitalize ml-1">{game.turn}</span></div>
          <button onClick={resetGame} className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm">New Game</button>
        </div>
      </header>


      <main className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

        <aside className="col-span-2 flex flex-col gap-4">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-md ring-1 ring-black/20 flex flex-col items-center gap-3">
            <h3 className="text-sm font-semibold text-neutral-200">Captured (W)</h3>
            <CapturedPieces pieces={game.captured.white} />
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-md ring-1 ring-black/20">
            <h4 className="text-sm font-semibold text-neutral-200 mb-2">Game Info</h4>
            <div className="text-xs text-neutral-400">Status: <span className="capitalize">{game.status}</span></div>
            <div className="text-xs text-neutral-400">Winner: <span className="capitalize">{game.winner || '—'}</span></div>
            <div className="text-xs text-neutral-400">Moves: {game.moveHistory.length}</div>
          </div>
        </aside>
        <section className="col-span-8 flex items-center justify-center">
          <div className="p-6 bg-gradient-to-b from-white/5 to-white/3 rounded-3xl shadow-2xl flex items-center justify-center">
            <ChessBoard
              board={game.board}
              legalMoves={legalMoves}
              selectedPiece={selectedPiece}
              inCheck={game.inCheck}
              onSquareClick={handleSquareClick}
            />
          </div>
        </section>

        <aside className="col-span-2 flex flex-col gap-4">
          <MoveHistory moveHistory={game.moveHistory} currentMoveIndex={currentMoveIndex} onJumpToMove={handleJumpToMove} />

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl shadow-md ring-1 ring-black/20 flex flex-col items-center gap-3">
            <h3 className="text-sm font-semibold text-neutral-200">Captured (B)</h3>
            <CapturedPieces pieces={game.captured.black} />
          </div>
        </aside>

      </main>

      {promotionData && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-30">
          <div className="bg-neutral-800 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl w-fit">
            <h3 className="text-2xl font-bold">Promote to:</h3>
            <div className="flex gap-4">
              {promotionPieces.map((pieceName) => (
                <button
                  key={pieceName}
                  className="w-20 h-20 p-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg flex items-center justify-center transition-colors"
                  onClick={() => handlePromotion(pieceName)}
                >
                  {React.cloneElement(pieceIcons[`${game.turn}_${pieceName}`], {
                    className: `w-full h-full`,
                  })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {game.winner && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-20">
          <div className="bg-neutral-800 p-8 rounded-2xl flex flex-col items-center gap-6 shadow-2xl">
            <h3 className="text-3xl font-bold">{game.winner === 'Stalemate' ? 'Stalemate' : `${game.winner.toUpperCase()} Wins`}</h3>
            <button onClick={resetGame} className="px-6 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white">Restart</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App