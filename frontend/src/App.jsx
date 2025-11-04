import React, { useState, useEffect } from "react";

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
  const [inCheck, setInCheck] = useState(null)

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

  const getColor = (coords, board) => {
    const b = board || chessBoard;
    const cell = b[coords[0]][coords[1]];
    if (!cell) return null;
    const color = cell[0].props.className.slice(0, 5)
    return color
  }

  const getType = (coords, board) => {
    const b = board || chessBoard;
    const cell = b[coords[0]][coords[1]];
    if (!cell) return null;
    const className = cell[0].props.className;
    const type = className.split(' ')[0].split('-')[1];
    return type;
  }

  function isValidPosition(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  const resetGame = () => {
    const newBoard = Array.from({ length: 8 }, () => Array(8).fill());
    setChessBoard(populateInitialBoard(newBoard));
    setLegalMove([]);
    setSelectedPiece([]);
    setWhitePieces([]);
    setBlackPieces([]);
    setTurn("white");
    setWinner("");
    setEnPassantTarget(null);
    setPromotionData(null);
    setInCheck(null);
  };

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

  const getSlidingMoves = (r, c, pieceColor, directions, board) => {
    const moves = [];
    for (const [dr, dc] of directions) {
      let newRow = r + dr;
      let newCol = c + dc;

      while (isValidPosition(newRow, newCol)) {
        const targetSquare = board[newRow][newCol];

        if (targetSquare) {
          if (getColor([newRow, newCol], board) !== pieceColor) {
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
        if (!targetSquare || getColor([newRow, newCol], board) !== pieceColor) {
          moves.push([newRow, newCol]);
        }
      }
    }
    return moves;
  };

  const getPseudoLegalMoves = (pieceColor, pieceType, row, col, board, currentEnPassantTarget) => {
    const possibleMoves = []
    const directionMultiplier = pieceColor === "white" ? -1 : 1

    switch (pieceType) {
      case "pawn": {
        const movesDone = board[row][col][1];
        const forward1 = [row + 1 * directionMultiplier, col];
        const forward2 = [row + 2 * directionMultiplier, col];
        const diagonalLeft = [row + 1 * directionMultiplier, col - 1];
        const diagonalRight = [row + 1 * directionMultiplier, col + 1];

        if (
          isValidPosition(forward1[0], forward1[1]) &&
          !board[forward1[0]][forward1[1]]
        ) {
          possibleMoves.push(forward1);
          if (
            movesDone === 0 &&
            isValidPosition(forward2[0], forward2[1]) &&
            !board[forward2[0]][forward2[1]]
          ) {
            possibleMoves.push(forward2);
          }
        }
        if (
          isValidPosition(diagonalLeft[0], diagonalLeft[1]) &&
          board[diagonalLeft[0]][diagonalLeft[1]]
        ) {
          if (getColor(diagonalLeft, board) !== pieceColor) {
            possibleMoves.push(diagonalLeft);
          }
        }
        if (
          isValidPosition(diagonalRight[0], diagonalRight[1]) &&
          board[diagonalRight[0]][diagonalRight[1]]
        ) {
          if (getColor(diagonalRight, board) !== pieceColor) {
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
        possibleMoves.push(
          ...getSlidingMoves(row, col, pieceColor, ROOK_DIRECTIONS, board)
        );
        break;
      case "knight":
        possibleMoves.push(
          ...getSteppingMoves(row, col, pieceColor, KNIGHT_OFFSETS, board)
        );
        break;
      case "bishop":
        possibleMoves.push(
          ...getSlidingMoves(row, col, pieceColor, BISHOP_DIRECTIONS, board)
        );
        break;
      case "queen":
        possibleMoves.push(
          ...getSlidingMoves(row, col, pieceColor, QUEEN_DIRECTIONS, board)
        );
        break;
      case "king": {
        possibleMoves.push(
          ...getSteppingMoves(row, col, pieceColor, KING_OFFSETS, board)
        );
        const movesDone = board[row][col][1];
        if (movesDone === 0) {
          const rookKingside = board[row][col + 3];
          if (
            !board[row][col + 1] &&
            !board[row][col + 2] &&
            rookKingside &&
            getType([row, col + 3], board) === 'rook' &&
            rookKingside[1] === 0
          ) {
            possibleMoves.push([row, col + 2]);
          }
          const rookQueenside = board[row][col - 4];
          if (
            !board[row][col - 1] &&
            !board[row][col - 2] &&
            !board[row][col - 3] &&
            rookQueenside &&
            getType([row, col - 4], board) === 'rook' &&
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
  
  const simulateMove = (board, from, to, pieceType) => {
    const newBoard = board.map(row => [...row]);
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    let newEnPassantTarget = null;
    const pieceColor = getColor(from, board);
    const directionMultiplier = pieceColor === "white" ? -1 : 1;

    const pieceData = newBoard[fromRow][fromCol];
    const newPieceData = [...pieceData];
    newPieceData[1] += 1;
    
    newBoard[toRow][toCol] = newPieceData;
    newBoard[fromRow][fromCol] = "";

    if (pieceType === 'pawn') {
      if (Math.abs(fromRow - toRow) === 2) {
        newEnPassantTarget = [fromRow + directionMultiplier, fromCol];
      }
      if (enPassantTarget && toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
        newBoard[toRow - directionMultiplier][toCol] = "";
      }
    }
    
    if (pieceType === 'king') {
      const moveDist = toCol - fromCol;
      if (moveDist === 2) {
        const rook = newBoard[fromRow][7];
        newBoard[fromRow][5] = [...rook];
        newBoard[fromRow][5][1] += 1;
        newBoard[fromRow][7] = "";
      } else if (moveDist === -2) {
        const rook = newBoard[fromRow][0];
        newBoard[fromRow][3] = [...rook];
        newBoard[fromRow][3][1] += 1;
        newBoard[fromRow][0] = "";
      }
    }
    
    return [newBoard, newEnPassantTarget];
  };
  
  const isKingInCheck = (kingColor, board, currentEnPassantTarget) => {
    let kingPos = null;
    const opponentColor = kingColor === 'white' ? 'black' : 'white';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && getType([r, c], board) === 'king' && getColor([r, c], board) === kingColor) {
          kingPos = [r, c];
          break;
        }
      }
      if (kingPos) break;
    }

    if (!kingPos) return false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && getColor([r, c], board) === opponentColor) {
          const pieceType = getType([r, c], board);
          const moves = getPseudoLegalMoves(opponentColor, pieceType, r, c, board, currentEnPassantTarget);
          for (const move of moves) {
            if (move[0] === kingPos[0] && move[1] === kingPos[1]) {
              return true;
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
      const [tempBoard, tempEnPassantTarget] = simulateMove(currentBoard, [row, col], move, pieceType);
      if (!isKingInCheck(pieceColor, tempBoard, tempEnPassantTarget)) {
        legalMoves.push(move);
      }
    }
    return legalMoves;
  };
  
  const doesPlayerHaveLegalMoves = (playerColor, board, currentEnPassantTarget) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] && getColor([r, c], board) === playerColor) {
          const pieceType = getType([r, c], board);
          const moves = getLegalMoves(playerColor, pieceType, r, c, board, currentEnPassantTarget);
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const handlePromotion = (pieceName) => {
    if (!promotionData) return;

    const { color, row, col, board } = promotionData;

    const newPieceIcon = pieces[color][pieceName].icon;
    const newPieceData = [newPieceIcon, 0];

    const boardCopy = board.map(r => [...r]);
    boardCopy[row][col] = newPieceData;
    
    const opponentColor = color === "white" ? "black" : "white";
    const kingIsInCheck = isKingInCheck(opponentColor, boardCopy, null);
    setInCheck(kingIsInCheck ? opponentColor : null);
    
    const opponentHasLegalMoves = doesPlayerHaveLegalMoves(opponentColor, boardCopy, null);
    if (kingIsInCheck && !opponentHasLegalMoves) {
      setWinner(color);
    } else if (!kingIsInCheck && !opponentHasLegalMoves) {
      setWinner("Stalemate");
    }

    setChessBoard(boardCopy);
    setPromotionData(null);
    setTurn(color === "white" ? "black" : "white");
    setEnPassantTarget(null);
  };

  const pieceClick = (key) => {
    const row = parseInt(key[0]);
    const col = parseInt(key[2]);

    if (selectedPiece.length !== 0) {
      if (isLegal(row, col)) {
        const [pieceType, [fromRow, fromCol]] = selectedPiece;
        const selectedColor = getColor([fromRow, fromCol]);
        let isKingCapture = false;

        const destinationPiece = chessBoard[row][col];
        if (destinationPiece && getType([row, col]) === 'king') {
            isKingCapture = true;
        }

        const [newBoard, newEnPassantTarget] = simulateMove(chessBoard, [fromRow, fromCol], [row, col], pieceType);

        if (destinationPiece) {
            const targetColor = getColor([row, col]);
            if (selectedColor !== targetColor) {
                const capturedPiece = chessBoard[row][col][0];
                if (targetColor === "white") {
                    setWhitePieces([...whitePieces, capturedPiece]);
                } else {
                    setBlackPieces([...blackPieces, capturedPiece]);
                }
            }
        } else if (pieceType === 'pawn' && enPassantTarget && row === enPassantTarget[0] && col === enPassantTarget[1]) {
            const capturedPawnRow = row - (selectedColor === 'white' ? -1 : 1);
            const capturedPiece = chessBoard[capturedPawnRow][col][0];
            const targetColor = getColor([capturedPawnRow, col]);
             if (targetColor === "white") {
                setWhitePieces([...whitePieces, capturedPiece]);
            } else {
                setBlackPieces([...blackPieces, capturedPiece]);
            }
        }
        
        if (pieceType === 'pawn' && (row === 0 || row === 7) && !isKingCapture) {
          setPromotionData({ color: selectedColor, row, col, board: newBoard });
          setChessBoard(newBoard);
          setLegalMove([]);
          setSelectedPiece([]);
          return;
        }
        
        const opponentColor = selectedColor === "white" ? "black" : "white";
        const kingIsInCheck = isKingInCheck(opponentColor, newBoard, newEnPassantTarget);
        setInCheck(kingIsInCheck ? opponentColor : null);
        
        const opponentHasLegalMoves = doesPlayerHaveLegalMoves(opponentColor, newBoard, newEnPassantTarget);
        if (kingIsInCheck && !opponentHasLegalMoves) {
            setWinner(selectedColor);
        } else if (!kingIsInCheck && !opponentHasLegalMoves) {
            setWinner("Stalemate");
        }

        setChessBoard(newBoard);
        setLegalMove([]);
        setSelectedPiece([]);
        setTurn(opponentColor);
        setEnPassantTarget(newEnPassantTarget);
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
        const moves = getLegalMoves(pieceColor, pieceType, row, col, chessBoard, enPassantTarget);
        setLegalMove(moves);
        setSelectedPiece([pieceType, [row, col]]);
      }
    }
  };


  const isLegal = (row, col) => {
    const exists = legalMove.some(([a, b]) => a === row && b === col);
    return exists
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
                  {React.cloneElement(pieces[promotionData.color][pieceName].icon, {
                    className: `w-full h-full`,
                  })}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {winner && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex justify-center items-center z-10">
          <div className="bg-neutral-800 p-10 rounded-lg flex flex-col items-center gap-6 text-white shadow-2xl">
            <h3 className="text-4xl font-bold">{winner === 'Stalemate' ? 'Stalemate!' : `${winner.toUpperCase()} Wins!`}</h3>
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
          <h3 className="text-lg font-bold text-neutral-400 mb-4">Captured</h3>
          <ul className="grid grid-cols-2 gap-2 w-full">
            {whitePieces.map((piece, pieceIndex) => (
              <li key={pieceIndex} className="w-full h-16 flex items-center justify-center">{piece}</li>
            ))}
          </ul>
        </div>

        <ul className="w-[80vh] h-[80vh] max-w-[800px] max-h-[800px] grid grid-cols-8 grid-rows-8 shadow-2xl overflow-hidden rounded-lg">
          {chessBoard.map((chessRow, rowIndex) => (
            chessRow.map((cell, colIndex) => {
              const isSelected = selectedPiece[1] && selectedPiece[1][0] === rowIndex && selectedPiece[1][1] === colIndex;
              const isMoveLegal = isLegal(rowIndex, colIndex);
              
              let isChecked = false;
              if (cell && getType([rowIndex, colIndex]) === 'king' && getColor([rowIndex, colIndex]) === inCheck) {
                isChecked = true;
              }

              return (
                <li
                  key={`r${rowIndex}c${colIndex}`}
                  className={`w-full h-full flex items-center justify-center relative cursor-pointer
                    ${(colIndex + rowIndex) % 2 === 0 ? "bg-stone-100" : "bg-green-700"}
                    ${isSelected ? "bg-yellow-300" : ""}
                    ${isChecked ? "bg-red-500" : ""}
                  `}
                  onClick={() => pieceClick(`${rowIndex}-${colIndex}`)}
                >
                  {cell ? cell[0] : cell}

                  {isMoveLegal && (
                    <>
                      {chessBoard[rowIndex][colIndex] ? (
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

        <div className="w-40 h-[80vh] max-h-[800px] bg-neutral-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
          <h3 className="text-lg font-bold text-neutral-400 mb-4">Captured</h3>
          <ul className="grid grid-cols-2 gap-2 w-full">
            {blackPieces.map((piece, pieceIndex) => (
              <li key={pieceIndex} className="w-full h-16 flex items-center justify-center">{piece}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {!winner && !promotionData && (
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

export default App

