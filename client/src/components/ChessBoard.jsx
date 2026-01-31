import { useState } from 'react';
import { pieceIcons } from '../assets/pieceIcons';

const typeMap = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

export default function ChessBoard({ chess, board, role, onMove }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [promotionSquare, setPromotionSquare] = useState(null);

  const getSquareName = (r, c) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return `${files[c]}${ranks[r]}`;
  };

  const handleSquareClick = (r, c) => {
    const squareName = getSquareName(r, c);
    const piece = board[r][c];

    if (selectedSquare && possibleMoves.includes(squareName)) {
      const movingPiece = chess.get(selectedSquare);
      const isPromotion = movingPiece.type === 'p' && (squareName[1] === '1' || squareName[1] === '8');

      if (isPromotion) {
        setPromotionSquare({ from: selectedSquare, to: squareName });
      } else {
        onMove(selectedSquare, squareName);
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
      return;
    }

    if (piece) {
      if (role && piece.color !== role) return; 
      setSelectedSquare(squareName);
      const moves = chess.moves({ square: squareName, verbose: true });
      setPossibleMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const finalizePromotion = (type) => {
    if (promotionSquare) {
      onMove(promotionSquare.from, promotionSquare.to, type);
      setPromotionSquare(null);
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const isBlackView = role === 'b';
  const displayBoard = isBlackView 
    ? [...board].reverse().map(row => [...row].reverse()) 
    : board;

  const getActualCoords = (r, c) => isBlackView ? [7 - r, 7 - c] : [r, c];

  return (
    <div className="relative w-full max-w-[600px] aspect-square mx-auto">
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full border-4 border-neutral-800 rounded-lg overflow-hidden bg-neutral-800 select-none shadow-2xl touch-none">
        {displayBoard.map((row, r) => 
          row.map((cell, c) => {
            const [actualR, actualC] = getActualCoords(r, c);
            const squareName = getSquareName(actualR, actualC);
            const isSelected = selectedSquare === squareName;
            const isPossibleMove = possibleMoves.includes(squareName);
            const isBlackSquare = (r + c) % 2 === 1;
            const lastMove = chess.history({ verbose: true }).pop();
            const isLastMove = lastMove && (lastMove.to === squareName || lastMove.from === squareName);

            let icon = null;
            if (cell) {
              const colorName = cell.color === 'w' ? 'white' : 'black';
              const typeName = typeMap[cell.type];
              icon = pieceIcons[`${colorName}_${typeName}`];
            }

            return (
              <div
                key={squareName}
                onClick={() => handleSquareClick(actualR, actualC)}
                className={`
                  relative flex items-center justify-center cursor-pointer transition-colors duration-150
                  ${isBlackSquare ? 'bg-neutral-600' : 'bg-neutral-300'}
                  ${isSelected ? '!bg-amber-200 ring-inset ring-2 md:ring-4 ring-amber-400' : ''}
                  ${isLastMove && !isSelected ? '!bg-amber-100/50' : ''}
                `}
              >
                {isPossibleMove && (
                  <div className={`absolute w-2 h-2 md:w-3 md:h-3 rounded-full z-10 ${cell ? 'bg-red-500 ring-2 ring-white' : 'bg-black/20'}`} />
                )}
                
                {icon && (
                  <div className="w-[85%] h-[85%] z-0 flex items-center justify-center transform hover:scale-105 transition-transform pointer-events-none">
                    {icon}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {promotionSquare && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg z-50 backdrop-blur-sm">
          <div className="bg-neutral-800 p-3 rounded-xl shadow-2xl border border-neutral-600">
            <h3 className="text-white text-center mb-2 font-bold text-sm">Promote</h3>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map(type => (
                <button 
                  key={type}
                  onClick={() => finalizePromotion(type)}
                  className="w-12 h-12 md:w-16 md:h-16 bg-neutral-700 hover:bg-neutral-600 rounded-lg flex items-center justify-center border border-neutral-600"
                >
                  <div className="transform scale-125">
                    {pieceIcons[`${chess.turn() === 'w' ? 'white' : 'black'}_${typeMap[type]}`]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}