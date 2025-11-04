import React, { useState, useEffect } from "react";
import { pieceIcons } from "./pieces";
import gameService from "./services/gameService";

function ChessBoard({ 
  board, 
  legalMoves, 
  selectedPiece, 
  inCheck, 
  onSquareClick 
}) {
  const isLegal = (row, col) => {
    return legalMoves.some(([r, c]) => r === row && c === col);
  };

  return (
    <ul className="w-[80vh] h-[80vh] max-w-[800px] max-h-[800px] grid grid-cols-8 grid-rows-8 shadow-2xl overflow-hidden rounded-lg">
      {board.map((chessRow, rowIndex) => (
        chessRow.map((cell, colIndex) => {
          const isSelected = selectedPiece && selectedPiece[0] === rowIndex && selectedPiece[1] === colIndex;
          const isMoveLegal = isLegal(rowIndex, colIndex);
          const isChecked = inCheck && inCheck[0] === rowIndex && inCheck[1] === colIndex;

          let pieceIcon = null;
          if (cell) {
            const key = `${cell.color}_${cell.type}`;
            pieceIcon = pieceIcons[key];
          }

          return (
            <li
              key={`r${rowIndex}c${colIndex}`}
              className={`w-full h-full flex items-center justify-center relative cursor-pointer
                ${(colIndex + rowIndex) % 2 === 0 ? "bg-stone-100" : "bg-green-700"}
                ${isSelected ? "bg-yellow-300" : ""}
                ${isChecked ? "bg-red-500" : ""}
              `}
              onClick={() => onSquareClick(rowIndex, colIndex)}
            >
              {pieceIcon}

              {isMoveLegal && (
                <>
                  {cell ? (
                    <div className="absolute inset-0.5 border-4 border-red-500 rounded-md" />
                  ) : (
                    <div className="absolute w-1/3 h-1/3 bg-black bg-opacity-20 rounded-full" />
                  )}
                </>
              )}
            </li>
          );
        })
      ))}
    </ul>
  );
}

function CapturedPieces({ pieces }) {
  return (
    <ul className="grid grid-cols-2 gap-2 w-full">
      {pieces.map((piece, index) => (
        <li key={index} className="w-full h-16 flex items-center justify-center">
          {pieceIcons[`${piece.color}_${piece.type}`]}
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [legalMoves, setLegalMoves] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [promotionData, setPromotionData] = useState(null);
  
  useEffect(() => {
    gameService.createGame()
      .then(initialGameState => {
        setGame(initialGameState);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error creating game:", err);
        setLoading(false);
      });
  }, []);

  const resetGame = async () => {
    setLoading(true);
    setLegalMoves([]);
    setSelectedPiece(null);
    setPromotionData(null);
    const newGame = await gameService.createGame();
    setGame(newGame);
    setLoading(false);
  };

  const handleSquareClick = async (row, col) => {
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
    if (!promotionData) return;
    
    try {
      const newGameState = await gameService.promotePawn(
        game._id, 
        promotionData.from,
        promotionData.to, 
        pieceName
      );
      setGame(newGameState);
      setPromotionData(null);
    } catch (error) {
      console.error("Error promoting pawn:", error);
    }
  };

  if (loading) {
    return <div className="relative min-h-screen bg-neutral-900 text-white flex justify-center items-center text-2xl">Loading Game...</div>;
  }
  
  if (!game) {
    return <div className="relative min-h-screen bg-neutral-900 text-white flex justify-center items-center text-2xl">Error loading game.</div>;
  }

  const promotionPieces = ['queen', 'rook', 'bishop', 'knight'];

  return (
    <div className="relative min-h-screen bg-neutral-900">
      {promotionData && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-20">
          <div className="bg-neutral-800 p-6 rounded-lg flex flex-col items-center gap-4 text-white shadow-2xl">
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
        <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-10">
          <div className="bg-neutral-800 p-10 rounded-lg flex flex-col items-center gap-6 text-white shadow-2xl">
            <h3 className="text-4xl font-bold">{game.winner === 'Stalemate' ? 'Stalemate!' : `${game.winner.toUpperCase()} Wins!`}</h3>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center items-center min-h-screen gap-8 p-8">
        
        <div className="w-40 h-[80vh] max-h-[800px] bg-neutral-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-lg font-bold text-neutral-400 mb-4">Captured (W)</h3>
          <CapturedPieces pieces={game.captured.white} />
        </div>

        <ChessBoard 
          board={game.board}
          legalMoves={legalMoves}
          selectedPiece={selectedPiece}
          inCheck={game.inCheck}
          onSquareClick={handleSquareClick}
        />

        <div className="w-40 h-[80vh] max-h-[800px] bg-neutral-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-lg font-bold text-neutral-400 mb-4">Captured (B)</h3>
          <CapturedPieces pieces={game.captured.black} />
        </div>
      </div>
      
      {!game.winner && !promotionData && (
        <button
          onClick={resetGame}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-colors z-10"
        >
          Reset Game
        </button>
      )}
    </div>
  )
}

export default App;