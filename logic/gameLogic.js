function isValidPosition(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

const getColor = (piece) => {
  if (!piece) return null;
  return piece.color;
};

const getType = (piece) => {
  if (!piece) return null;
  return piece.type;
};

const ROOK_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const BISHOP_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const QUEEN_DIRECTIONS = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];
const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [1, -2], [-1, 2], [1, 2]];
const KING_OFFSETS = QUEEN_DIRECTIONS;

const getSlidingMoves = (r, c, pieceColor, directions, board) => {
  const moves = [];
  for (const [dr, dc] of directions) {
    let newRow = r + dr;
    let newCol = c + dc;
    while (isValidPosition(newRow, newCol)) {
      const targetSquare = board[newRow][newCol];
      if (targetSquare) {
        if (getColor(targetSquare) !== pieceColor) {
          moves.push([newRow, newCol]);
        }
        break;
      } else {
        moves.push([newRow, newCol]);
      }
      newRow += dr;
      newCol += dc;
    }
  }
  return moves;
};

const getSteppingMoves = (r, c, pieceColor, offsets, board) => {
  const moves = [];
  for (const [dr, dc] of offsets) {
    const newRow = r + dr;
    const newCol = c + dc;
    if (isValidPosition(newRow, newCol)) {
      const targetSquare = board[newRow][newCol];
      if (!targetSquare || getColor(targetSquare) !== pieceColor) {
        moves.push([newRow, newCol]);
      }
    }
  }
  return moves;
};

const getPseudoLegalMoves = (pieceColor, pieceType, row, col, board, currentEnPassantTarget) => {
  const possibleMoves = [];
  const directionMultiplier = pieceColor === "white" ? -1 : 1;

  switch (pieceType) {
    case "pawn": {
      const movesDone = board[row][col].moveCounter; 
      const forward1 = [row + 1 * directionMultiplier, col];
      const forward2 = [row + 2 * directionMultiplier, col];
      const diagonalLeft = [row + 1 * directionMultiplier, col - 1];
      const diagonalRight = [row + 1 * directionMultiplier, col + 1];

      if (isValidPosition(forward1[0], forward1[1]) && !board[forward1[0]][forward1[1]]) {
        possibleMoves.push(forward1);
        if (movesDone === 0 && isValidPosition(forward2[0], forward2[1]) && !board[forward2[0]][forward2[1]]) {
          possibleMoves.push(forward2);
        }
      }
      if (isValidPosition(diagonalLeft[0], diagonalLeft[1]) && board[diagonalLeft[0]][diagonalLeft[1]]) {
        if (getColor(board[diagonalLeft[0]][diagonalLeft[1]]) !== pieceColor) {
          possibleMoves.push(diagonalLeft);
        }
      }
      if (isValidPosition(diagonalRight[0], diagonalRight[1]) && board[diagonalRight[0]][diagonalRight[1]]) {
        if (getColor(board[diagonalRight[0]][diagonalRight[1]]) !== pieceColor) {
          possibleMoves.push(diagonalRight);
        }
      }
      if (currentEnPassantTarget) {
        const [epRow, epCol] = currentEnPassantTarget;
        if (epRow === row + directionMultiplier && (epCol === col - 1 || epCol === col + 1)) {
          if (isValidPosition(epRow, epCol) && !board[epRow][epCol]) {
            possibleMoves.push([epRow, epCol]);
          }
        }
      }
      break;
    }
    case "rook":
      possibleMoves.push(...getSlidingMoves(row, col, pieceColor, ROOK_DIRECTIONS, board));
      break;
    case "knight":
      possibleMoves.push(...getSteppingMoves(row, col, pieceColor, KNIGHT_OFFSETS, board));
      break;
    case "bishop":
      possibleMoves.push(...getSlidingMoves(row, col, pieceColor, BISHOP_DIRECTIONS, board));
      break;
    case "queen":
      possibleMoves.push(...getSlidingMoves(row, col, pieceColor, QUEEN_DIRECTIONS, board));
      break;
    case "king": {
      possibleMoves.push(...getSteppingMoves(row, col, pieceColor, KING_OFFSETS, board));
      const movesDone = board[row][col].moveCounter;
      if (movesDone === 0) {
        const rookKingside = board[row][col + 3];
        if (
          !board[row][col + 1] &&
          !board[row][col + 2] &&
          rookKingside &&
          getType(rookKingside) === 'rook' &&
          rookKingside.moveCounter === 0
        ) {
          possibleMoves.push([row, col + 2]);
        }
        const rookQueenside = board[row][col - 4];
        if (
          !board[row][col - 1] &&
          !board[row][col - 2] &&
          !board[row][col - 3] &&
          rookQueenside &&
          getType(rookQueenside) === 'rook' &&
          rookQueenside.moveCounter === 0
        ) {
          possibleMoves.push([row, col - 2]);
        }
      }
      break;
    }
    default:
      break;
  }
  return possibleMoves;
};

const simulateMove = (board, from, to, pieceType, currentEnPassantTarget) => {
  const newBoard = board.map(row => [...row]);
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  let newEnPassantTarget = null;
  const pieceColor = getColor(board[fromRow][fromCol]);
  const directionMultiplier = pieceColor === "white" ? -1 : 1;

  const pieceData = newBoard[fromRow][fromCol];
  const newPieceData = { ...pieceData, moveCounter: pieceData.moveCounter + 1 };
  
  let capturedPiece = newBoard[toRow][toCol] ? { ...newBoard[toRow][toCol] } : null;

  newBoard[toRow][toCol] = newPieceData;
  newBoard[fromRow][fromCol] = null;

  let isEnPassantCapture = false;

  if (pieceType === 'pawn') {
    if (Math.abs(fromRow - toRow) === 2) {
      newEnPassantTarget = [fromRow + directionMultiplier, fromCol];
    }
    if (currentEnPassantTarget && toRow === currentEnPassantTarget[0] && toCol === currentEnPassantTarget[1]) {
      const capturedPawnPos = [toRow - directionMultiplier, toCol];
      capturedPiece = { ...newBoard[capturedPawnPos[0]][capturedPawnPos[1]] };
      newBoard[capturedPawnPos[0]][capturedPawnPos[1]] = null;
      isEnPassantCapture = true;
    }
  }
  
  if (pieceType === 'king') {
    const moveDist = toCol - fromCol;
    if (moveDist === 2) {
      const rook = newBoard[fromRow][7];
      const newRook = { ...rook, moveCounter: rook.moveCounter + 1 };
      newBoard[fromRow][5] = newRook;
      newBoard[fromRow][7] = null;
    } else if (moveDist === -2) {
      const rook = newBoard[fromRow][0];
      const newRook = { ...rook, moveCounter: rook.moveCounter + 1 };
      newBoard[fromRow][3] = newRook;
      newBoard[fromRow][0] = null;
    }
  }
  
  return [newBoard, newEnPassantTarget, capturedPiece, isEnPassantCapture];
};

const isKingInCheck = (kingColor, board, currentEnPassantTarget) => {
  let kingPos = null;
  const opponentColor = kingColor === 'white' ? 'black' : 'white';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && getType(piece) === 'king' && getColor(piece) === kingColor) {
        kingPos = [r, c];
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && getColor(piece) === opponentColor) {
        const pieceType = getType(piece);
        const moves = getPseudoLegalMoves(opponentColor, pieceType, r, c, board, currentEnPassantTarget);
        for (const move of moves) {
          if (move[0] === kingPos[0] && move[1] === kingPos[1]) {
            return kingPos;
          }
        }
      }
    }
  }
  return false;
};

const getLegalMoves = (pieceColor, pieceType, row, col, currentBoard, currentEnPassantTarget) => {
  const pseudoMoves = getPseudoLegalMoves(pieceColor, pieceType, row, col, currentBoard, currentEnPassantTarget);
  const legalMoves = [];

  for (const move of pseudoMoves) {
    const [tempBoard, tempEnPassantTarget] = simulateMove(currentBoard, [row, col], move, pieceType, currentEnPassantTarget);
    if (!isKingInCheck(pieceColor, tempBoard, tempEnPassantTarget)) {
      legalMoves.push(move);
    }
  }
  return legalMoves;
};

const doesPlayerHaveLegalMoves = (playerColor, board, currentEnPassantTarget) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && getColor(piece) === playerColor) {
        const pieceType = getType(piece);
        const moves = getLegalMoves(playerColor, pieceType, r, c, board, currentEnPassantTarget);
        if (moves.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

module.exports = {
  isValidPosition,
  getColor,
  getType,
  getPseudoLegalMoves,
  simulateMove,
  isKingInCheck,
  getLegalMoves,
  doesPlayerHaveLegalMoves
};
