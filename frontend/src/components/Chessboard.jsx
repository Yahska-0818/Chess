import { pieceIcons } from "../pieces"


const ChessBoard = ({ board, legalMoves, selectedPiece, inCheck, onSquareClick }) => {
  const isLegal = (row, col) => {
    return legalMoves.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="w-[80vh] h-[80vh] max-w-[720px] max-h-[720px] grid grid-cols-8 grid-rows-8 shadow-2xl overflow-hidden rounded-2xl ring-1 ring-black/20">
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

          const squareClasses = [
            "relative w-full h-full flex items-center justify-center text-2xl transition-all select-none",
            (colIndex + rowIndex) % 2 === 0 ? "bg-white/90" : "bg-slate-800/80",
            isSelected ? "ring-4 ring-amber-300/60" : "",
            isChecked ? "bg-red-500/90" : ""
          ].join(" ");

          return (
            <div key={`r${rowIndex}c${colIndex}`} className={squareClasses} onClick={() => onSquareClick(rowIndex, colIndex)}>
              {pieceIcon}
              {isMoveLegal && (
                <>
                  {cell ? (
                    <div className="absolute inset-1 border-4 border-rose-500 rounded-md" />
                  ) : (
                    <div className="absolute w-1/4 h-1/4 bg-yellow-400/70 rounded-full" />
                  )}
                </>
              )}
            </div>
          );
        })
      ))}
    </div>
  );
}

export default ChessBoard