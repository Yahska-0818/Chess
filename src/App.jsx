import { useState, useEffect } from "react";
import { pieces } from "./pieces";

const populateInitialBoard = (boardMatrix) => {
  const boardCopy = boardMatrix.map(row => [...row]);

  Object.entries(pieces).forEach(([color, pieceSet]) => {
    Object.entries(pieceSet).forEach(([pieceName, pieceData]) => {
      const positions = pieceData.startingPosition;

      const normalizedPositions = Array.isArray(positions[0]) ? positions : (
        pieceName === 'pawn'
          ? Array.from({ length: 8 }, (_, i) => [positions[0], i])
          : [positions]
      );

      normalizedPositions.forEach(([row, col]) => {
        boardCopy[row][col] = [pieceData.icon, pieceData.moveCounter];
      });
    });
  });

  return boardCopy
}

function App() {

  const [chessBoard, setChessBoard] = useState(Array.from({ length: 8 }, () => Array(8).fill()))
  const [legalMove, setLegalMove] = useState([])
  const [selectedPiece, setSelectedPiece] = useState([])
  const [whitePieces, setWhitePieces] = useState([])
  const [blackPieces, setBlackPieces] = useState([])
  const [turn, setTurn] = useState("white")
  const [winner, setWinner] = useState("")
  const [enPassantTarget, setEnPassantTarget] = useState(null)
  const [promotionData, setPromotionData] = useState(null)

  useEffect(() => {
    const boardCopy = chessBoard.map(row => [...row])
    setChessBoard(populateInitialBoard(boardCopy))
  }, [])

  useEffect(() => {
    const blackHasKing = blackPieces.some(p => p.props.className.includes("king"));
    const whiteHasKing = whitePieces.some(p => p.props.className.includes("king"));

    if (whiteHasKing) {
      setWinner("Black");
    } else if (blackHasKing) {
      setWinner("White");
    }
  }, [blackPieces, whitePieces]);

  const getColor = (coords) => {
    const color = chessBoard[coords[0]][coords[1]][0].props.className.slice(0, 5)
    return color
  }

  const getType = (coords) => {
    const type = chessBoard[coords[0]][coords[1]][0].props.className.slice(6, -12)
    return type
  }

  function isValidPosition(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  const ROOK_DIRECTIONS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const BISHOP_DIRECTIONS = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  const QUEEN_DIRECTIONS = [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS];
  const KNIGHT_OFFSETS = [
    [-2, -1], [-2, 1],
    [2, -1], [2, 1],
    [-1, -2], [1, -2],
    [-1, 2], [1, 2],
  ];
  const KING_OFFSETS = QUEEN_DIRECTIONS;

  const getSlidingMoves = (r, c, pieceColor, directions) => {
    const moves = [];
    for (const [dr, dc] of directions) {
      let newRow = r + dr;
      let newCol = c + dc;

      while (isValidPosition(newRow, newCol)) {
        const targetSquare = chessBoard[newRow][newCol];

        if (targetSquare) {
          if (getColor([newRow, newCol]) !== pieceColor) {
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

  const getSteppingMoves = (r, c, pieceColor, offsets) => {
    const moves = [];
    for (const [dr, dc] of offsets) {
      const newRow = r + dr;
      const newCol = c + dc;

      if (isValidPosition(newRow, newCol)) {
        const targetSquare = chessBoard[newRow][newCol];
        if (!targetSquare || getColor([newRow, newCol]) !== pieceColor) {
          moves.push([newRow, newCol]);
        }
      }
    }
    return moves;
  };

  const getLegalMoves = (pieceColor, pieceType, row, col) => {
    const possibleMoves = []
    const directionMultiplier = pieceColor === "white" ? -1 : 1

    switch (pieceType) {
      case "pawn": {
        const movesDone = chessBoard[row][col][1];
        const forward1 = [row + 1 * directionMultiplier, col];
        const forward2 = [row + 2 * directionMultiplier, col];
        const diagonalLeft = [row + 1 * directionMultiplier, col - 1];
        const diagonalRight = [row + 1 * directionMultiplier, col + 1];

        if (
          isValidPosition(forward1[0], forward1[1]) &&
          !chessBoard[forward1[0]][forward1[1]]
        ) {
          possibleMoves.push(forward1);
          if (
            movesDone === 0 &&
            isValidPosition(forward2[0], forward2[1]) &&
            !chessBoard[forward2[0]][forward2[1]]
          ) {
            possibleMoves.push(forward2);
          }
        }
        if (
          isValidPosition(diagonalLeft[0], diagonalLeft[1]) &&
          chessBoard[diagonalLeft[0]][diagonalLeft[1]]
        ) {
          if (getColor(diagonalLeft) !== pieceColor) {
            possibleMoves.push(diagonalLeft);
          }
        }
        if (
          isValidPosition(diagonalRight[0], diagonalRight[1]) &&
          chessBoard[diagonalRight[0]][diagonalRight[1]]
        ) {
          if (getColor(diagonalRight) !== pieceColor) {
            possibleMoves.push(diagonalRight);
          }
        }
        if (enPassantTarget) {
          const [epRow, epCol] = enPassantTarget;
          if (epRow === row + directionMultiplier && Math.abs(epCol - col) === 1) {
            possibleMoves.push([epRow, epCol]);
          }
        }
        break;
      }
      case "rook":
        possibleMoves.push(
          ...getSlidingMoves(row, col, pieceColor, ROOK_DIRECTIONS)
        );
        break;
      case "knight":
        possibleMoves.push(
          ...getSteppingMoves(row, col, pieceColor, KNIGHT_OFFSETS)
        );
        break;
      case "bishop":
        possibleMoves.push(
          ...getSlidingMoves(row, col, pieceColor, BISHOP_DIRECTIONS)
        );
        break;
      case "queen":
        possibleMoves.push(
          ...getSlidingMoves(row, col, pieceColor, QUEEN_DIRECTIONS)
        );
        break;
      case "king": {
        possibleMoves.push(
          ...getSteppingMoves(row, col, pieceColor, KING_OFFSETS)
        );
        const movesDone = chessBoard[row][col][1];
        if (movesDone === 0) {
          const rookKingside = chessBoard[row][col + 3];
          if (
            !chessBoard[row][col + 1] &&
            !chessBoard[row][col + 2] &&
            rookKingside &&
            getType([row, col + 3]) === 'rook' &&
            rookKingside[1] === 0 
          ) {
            possibleMoves.push([row, col + 2]);
          }
          const rookQueenside = chessBoard[row][col - 4];
          if (
            !chessBoard[row][col - 1] &&
            !chessBoard[row][col - 2] &&
            !chessBoard[row][col - 3] &&
            rookQueenside &&
            getType([row, col - 4]) === 'rook' &&
            rookQueenside[1] === 0
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
  }

  const handlePromotion = (pieceName) => {
    if (!promotionData) return;

    const { color, row, col } = promotionData;

    const newPieceIcon = pieces[color][pieceName].icon;
    const newPieceData = [newPieceIcon, 0];

    const boardCopy = chessBoard.map(r => [...r]);
    boardCopy[row][col] = newPieceData;
    setChessBoard(boardCopy);

    setPromotionData(null);
    setTurn(color === "white" ? "black" : "white");
    setEnPassantTarget(null);
  };

  const pieceClick = (key) => {
    const row = parseInt(key[0]);
    const col = parseInt(key[2]);
    const boardCopy = chessBoard.map(row => [...row]);
    const blackPiecesCopy = [...blackPieces];
    const whitePiecesCopy = [...whitePieces];

    if (selectedPiece.length !== 0) {
      if (isLegal(row, col)) {
        const [pieceType, [fromRow, fromCol]] = selectedPiece;
        const selectedColor = getColor([fromRow, fromCol]);
        const directionMultiplier = selectedColor === "white" ? -1 : 1;
        let isEnPassant = false;

        if (pieceType === "pawn" && enPassantTarget &&
          row === enPassantTarget[0] && col === enPassantTarget[1]) {

          isEnPassant = true;
          const capturedPawnRow = row - directionMultiplier;
          const capturedPiece = boardCopy[capturedPawnRow][col];

          if (capturedPiece) {
            const targetColor = getColor([capturedPawnRow, col]);
            if (targetColor === "white") {
              whitePiecesCopy.push(capturedPiece[0]);
              setWhitePieces(whitePiecesCopy);
            } else {
              blackPiecesCopy.push(capturedPiece[0]);
              setBlackPieces(blackPiecesCopy);
            }
            boardCopy[capturedPawnRow][col] = "";
          }
        }
        const destinationPiece = chessBoard[row][col];
        if (destinationPiece && !isEnPassant) {
          const targetColor = getColor([row, col]);
          if (selectedColor !== targetColor) {
            if (targetColor === "white") {
              whitePiecesCopy.push(destinationPiece[0]);
              setWhitePieces(whitePiecesCopy);
            } else {
              blackPiecesCopy.push(destinationPiece[0]);
              setBlackPieces(blackPiecesCopy);
            }
          }
        }

        boardCopy[fromRow][fromCol][1] += 1;
        boardCopy[row][col] = boardCopy[fromRow][fromCol];
        boardCopy[fromRow][fromCol] = "";

        if (pieceType === 'king') {
          const moveDist = col - fromCol;
          if (moveDist === 2) {
            const rook = boardCopy[row][7];
            boardCopy[row][5] = rook;
            boardCopy[row][7] = "";
            boardCopy[row][5][1] += 1;
          } else if (moveDist === -2) {
            const rook = boardCopy[row][0];
            boardCopy[row][3] = rook;
            boardCopy[row][0] = "";
            boardCopy[row][3][1] += 1;
          }
        }

        if (pieceType === 'pawn' && (row === 0 || row === 7)) {
          setPromotionData({ color: selectedColor, row, col });
          setChessBoard(boardCopy);
          setLegalMove([]);
          setSelectedPiece([]);
          return;
        }


        setChessBoard(boardCopy);
        setLegalMove([]);
        setSelectedPiece([]);
        setTurn(selectedColor === "white" ? "black" : "white");


        if (pieceType === "pawn" && Math.abs(fromRow - row) === 2) {
          setEnPassantTarget([fromRow + (row - fromRow) / 2, fromCol]);
        } else {
          setEnPassantTarget(null);
        }
        return;
      } else {
        setLegalMove([]);
        setSelectedPiece([]);
      }
    }

    if (chessBoard[row][col] && !promotionData) { 
      const pieceColor = getColor([row, col]);
      const pieceType = getType([row, col]);

      if (pieceColor === turn && !winner) {
        const moves = getLegalMoves(pieceColor, pieceType, row, col);
        setLegalMove(moves);
        setSelectedPiece([pieceType, [row, col]]);
      }
    }
  };


  const isLegal = (row, col) => {
    const exists = legalMove.some(([a, b]) => a === row && b === col);
    return exists
  }

  return (
    <div className="relative">
      {promotionData && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center gap-3">
            <h3 className="text-xl font-bold">Promote Pawn to:</h3>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                onClick={() => handlePromotion('queen')}
              >
                Queen
              </button>
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                onClick={() => handlePromotion('rook')}
              >
                Rook
              </button>
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                onClick={() => handlePromotion('bishop')}
              >
                Bishop
              </button>
              <button
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                onClick={() => handlePromotion('knight')}
              >
                Knight
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-evenly items-center min-h-screen gap-6 bg-black">
        <ul className="whitePieces border-2 border-black grid grid-cols-2 grid-rows-8 w-80 h-230 bg-yellow-200 place-items-center rounded-xl">
          {whitePieces.map((piece, pieceIndex) => (
            <li key={pieceIndex} className="w-30 flex items-center justify-center">{piece}</li>
          ))}
        </ul>
        <ul className="chessBox border-8 border-white w-250 h-230 grid grid-cols-8 grid-rows-8 rounded-xl">
          {chessBoard.map((chessRow, rowIndex) => (
            chessRow.map((cell, colIndex) => (
              <li
                key={`r${rowIndex}c${colIndex}`}
                className={`w-full h-full flex items-center justify-center border ${isLegal(rowIndex, colIndex)
                    ? chessBoard[rowIndex][colIndex] ? "bg-red-600" : "bg-white"
                    : (colIndex + rowIndex) % 2 === 0
                      ? "bg-yellow-200"
                      : "bg-yellow-800"
                  }`}
                onClick={() => pieceClick(`${rowIndex}-${colIndex}`)}
              >
                {cell ? cell[0] : cell}
              </li>
            ))
          ))}
        </ul>
        <ul className="blackPieces border-2 border-black grid grid-cols-2 grid-rows-8 w-80 h-230 rounded-xl bg-yellow-800 place-items-center">
          {blackPieces.map((piece, pieceIndex) => (
            <li key={pieceIndex} className="w-30 flex items-center justify-center">{piece}</li>
          ))}
        </ul>
      </div>
      <p className={`text-2xl text-red-600 ${winner ? "absolute" : "none"} bottom-1/2 p-10 bg-black w-full flex justify-center`}>{winner} Wins</p>
    </div>
  )
}

export default App