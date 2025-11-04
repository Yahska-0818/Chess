
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PIECE_PREFIX = {
  pawn: '',
  knight: 'N',
  bishop: 'B',
  rook: 'R',
  queen: 'Q',
  king: 'K'
};

const toAlgebraic = (row, col) => {
  return FILES[col] + RANKS[row];
};

const getAlgebraicNotation = (moveData) => {
  if (moveData.castling === 'kingside') return 'O-O';
  if (moveData.castling === 'queenside') return 'O-O-O';

  const piecePrefix = PIECE_PREFIX[moveData.piece.type];
  const toSquare = toAlgebraic(moveData.to[0], moveData.to[1]);
  let notation = '';

  if (moveData.piece.type === 'pawn') {
    if (moveData.isCapture || moveData.isEnPassant) {
      const fromFile = FILES[moveData.from[1]];
      notation = `${fromFile}x${toSquare}`;
    } else {
      notation = toSquare;
    }
  } else {
    notation = piecePrefix;
    if (moveData.isCapture) {
      notation += 'x';
    }
    notation += toSquare;
  }

  if (moveData.promotion) {
    notation += `=${PIECE_PREFIX[moveData.promotion].toUpperCase()}`;
  }

  if (moveData.isCheckmate) {
    notation += '#';
  } else if (moveData.isCheck) {
    notation += '+';
  }

  return notation;
};

module.exports = {
  toAlgebraic,
  getAlgebraicNotation
};
