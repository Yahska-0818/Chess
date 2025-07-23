import { useState, useEffect } from "react";

const pieces = {
  "black": {
    "pawn": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-pawn w-fit h-fit"><title>chess-pawn</title><path d="M19 22H5V20H19V22M16 18H8L10.18 10H8V8H10.72L10.79 7.74C10.1 7.44 9.55 6.89 9.25 6.2C8.58 4.68 9.27 2.91 10.79 2.25C12.31 1.58 14.08 2.27 14.74 3.79C15.41 5.31 14.72 7.07 13.2 7.74L13.27 8H16V10H13.82L16 18Z" /></svg>,
      startingPosition: [1],
      moveCounter: 0
    },
    "rook": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-rook w-fit h-fit"><title>chess-rook</title><path d="M5,20H19V22H5V20M17,2V5H15V2H13V5H11V2H9V5H7V2H5V8H7V18H17V8H19V2H17Z" /></svg>,
      startingPosition: [[0,0],[0,7]],
      moveCounter: 0
    },
    "knight": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-knight w-fit h-fit"><title>chess-knight</title><path d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.8,9.59 12.69,10.3 12.22,10.77L7.42,15.57C6.87,16.13 6.87,17.03 7.43,17.58C7.69,17.84 8.05,18 8.42,18H17V6A4,4 0 0,0 13,2Z" /></svg>,
      startingPosition: [[0,1],[0,6]],
      moveCounter: 0
    },
    "bishop": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-bishop w-fit h-fit"><title>chess-bishop</title><path d="M19,22H5V20H19V22M17.16,8.26C18.22,9.63 18.86,11.28 19,13C19,15.76 15.87,18 12,18C8.13,18 5,15.76 5,13C5,10.62 7.33,6.39 10.46,5.27C10.16,4.91 10,4.46 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.46 13.84,4.91 13.54,5.27C14.4,5.6 15.18,6.1 15.84,6.74L11.29,11.29L12.71,12.71L17.16,8.26Z" /></svg>,
      startingPosition: [[0,2],[0,5]],
      moveCounter: 0
    },
    "queen": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-queen w-fit h-fit"><title>chess-queen</title><path d="M18,3A2,2 0 0,1 20,5C20,5.81 19.5,6.5 18.83,6.82L17,13.15V18H7V13.15L5.17,6.82C4.5,6.5 4,5.81 4,5A2,2 0 0,1 6,3A2,2 0 0,1 8,5C8,5.5 7.82,5.95 7.5,6.3L10.3,9.35L10.83,5.62C10.33,5.26 10,4.67 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.67 13.67,5.26 13.17,5.62L13.7,9.35L16.47,6.29C16.18,5.94 16,5.5 16,5A2,2 0 0,1 18,3M5,20H19V22H5V20Z" /></svg>,
      startingPosition:[0,3],
      moveCounter: 0
    },
    "king": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-king w-fit h-fit"><title>chess-king</title><path d="M19,22H5V20H19V22M17,10C15.58,10 14.26,10.77 13.55,12H13V7H16V5H13V2H11V5H8V7H11V12H10.45C9.35,10.09 6.9,9.43 5,10.54C3.07,11.64 2.42,14.09 3.5,16C4.24,17.24 5.57,18 7,18H17A4,4 0 0,0 21,14A4,4 0 0,0 17,10Z" /></svg>,
      startingPosition: [0,4],
      moveCounter: 0
    }
  },
  "white": {
    "pawn": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="white-pawn w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-pawn</title><path d="M19 22H5V20H19V22M16 18H8L10.18 10H8V8H10.72L10.79 7.74C10.1 7.44 9.55 6.89 9.25 6.2C8.58 4.68 9.27 2.91 10.79 2.25C12.31 1.58 14.08 2.27 14.74 3.79C15.41 5.31 14.72 7.07 13.2 7.74L13.27 8H16V10H13.82L16 18Z" /></svg>,
      startingPosition: [6],
      moveCounter: 0
    },
    "rook": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="white-rook w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-rook</title><path d="M5,20H19V22H5V20M17,2V5H15V2H13V5H11V2H9V5H7V2H5V8H7V18H17V8H19V2H17Z" /></svg>,
      startingPosition: [[7,0],[7,7]],
      moveCounter: 0
    },
    "knight": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="white-knight w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-knight</title><path d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.8,9.59 12.69,10.3 12.22,10.77L7.42,15.57C6.87,16.13 6.87,17.03 7.43,17.58C7.69,17.84 8.05,18 8.42,18H17V6A4,4 0 0,0 13,2Z" /></svg>,
      startingPosition: [[7,1],[7,6]],
      moveCounter: 0
    },
    "bishop": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="white-bishop w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-bishop</title><path d="M19,22H5V20H19V22M17.16,8.26C18.22,9.63 18.86,11.28 19,13C19,15.76 15.87,18 12,18C8.13,18 5,15.76 5,13C5,10.62 7.33,6.39 10.46,5.27C10.16,4.91 10,4.46 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.46 13.84,4.91 13.54,5.27C14.4,5.6 15.18,6.1 15.84,6.74L11.29,11.29L12.71,12.71L17.16,8.26Z" /></svg>,
      startingPosition: [[7,2],[7,5]],
      moveCounter: 0
    },
    "queen": {
      icon:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="white-queen w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-queen</title><path d="M18,3A2,2 0 0,1 20,5C20,5.81 19.5,6.5 18.83,6.82L17,13.15V18H7V13.15L5.17,6.82C4.5,6.5 4,5.81 4,5A2,2 0 0,1 6,3A2,2 0 0,1 8,5C8,5.5 7.82,5.95 7.5,6.3L10.3,9.35L10.83,5.62C10.33,5.26 10,4.67 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.67 13.67,5.26 13.17,5.62L13.7,9.35L16.47,6.29C16.18,5.94 16,5.5 16,5A2,2 0 0,1 18,3M5,20H19V22H5V20Z" /></svg>,
      startingPosition: [7,3],
      moveCounter: 0
    },
    "king": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="white-king w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-king</title><path d="M19,22H5V20H19V22M17,10C15.58,10 14.26,10.77 13.55,12H13V7H16V5H13V2H11V5H8V7H11V12H10.45C9.35,10.09 6.9,9.43 5,10.54C3.07,11.64 2.42,14.09 3.5,16C4.24,17.24 5.57,18 7,18H17A4,4 0 0,0 21,14A4,4 0 0,0 17,10Z" /></svg>,
      startingPosition: [7,4],
      moveCounter: 0
    }
  }
}

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
        boardCopy[row][col] = [pieceData.icon,pieceData.moveCounter];
      });
    });
  });

  return boardCopy
}

function App() {

  const [chessBoard,setChessBoard] = useState(Array.from({ length: 8 }, () => Array(8).fill()))
  const [legalMove,setLegalMove] = useState([])
  const [selectedPiece,setSelectedPiece] = useState([])
  const [whitePieces,setWhitePieces] = useState([])
  const [blackPieces,setBlackPieces] = useState([])
  const [turn,setTurn] = useState("white")

  useEffect(()=>{
    const boardCopy = chessBoard.map(row => [...row])
    setChessBoard(populateInitialBoard(boardCopy))
  },[])

  const getColor = (coords) => {
    const color = chessBoard[coords[0]][coords[1]][0].props.className.slice(0,5)
    return color
  }

  const getType = (coords) => {
    const type = chessBoard[coords[0]][coords[1]][0].props.className.slice(6,-12)
    return type
  }

  function isValidPosition(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

  const getLegalMoves = (pieceColor,pieceType,row,col) => {
    const directionMultiplier = pieceColor == "white" ? -1 : 1
    const possibleMoves = []
    const selectedPieceCopy = [...selectedPiece]
    if (pieceType == "pawn") {
      let movesDone = chessBoard[row][col][1]
      const forward1 = [row+1*directionMultiplier,col]
      const forward2 = [row+2*directionMultiplier,col]
      const diagonalRight = [row+1*directionMultiplier,col+1]
      const diagonalLeft = [row+1*directionMultiplier,col-1]
      if (movesDone == 0) {
        if (!(chessBoard[forward1[0]][forward1[1]])) {
          possibleMoves.push(forward1)
          if (!(chessBoard[forward2[0]][forward2[1]])) {
            possibleMoves.push(forward2)
          }
        }
      } else if (movesDone > 0) {
          if (!(chessBoard[forward1[0]][forward1[1]])) {
            possibleMoves.push(forward1)
          }
      } if (chessBoard[diagonalRight[0]][diagonalRight[1]]) {
        const secondPieceColor = getColor([diagonalRight[0],diagonalRight[1]])
        if (secondPieceColor != pieceColor) {
          possibleMoves.push(diagonalRight)
        }
      } if (chessBoard[diagonalLeft[0]][diagonalLeft[1]]) {
        const secondPieceColor = getColor([diagonalLeft[0],diagonalLeft[1]])
        if (secondPieceColor != pieceColor) {
          possibleMoves.push(diagonalLeft)
        }
      }
    } else if (pieceType == "rook") {
      const forward = row-1
      const backward = row + 1
      const left = col - 1
      const right = col + 1
      for (let i = forward; i > -1; i--) {
        if (chessBoard[i][col]) {
          const nextCol = getColor([i,col])
          if (nextCol != pieceColor) {
            possibleMoves.push([i,col])
            break
          } else {
            break
          }
        } else {
          possibleMoves.push([i,col])
        }
      }
      for (let i = backward; i < 8; i++) {
        if (chessBoard[i][col]) {
          const nextCol = getColor([i,col])
          if (nextCol != pieceColor) {
            possibleMoves.push([i,col])
            break
          } else{
            break
          }
        } else {
          possibleMoves.push([i,col])
        }
      }
      for (let i = left; i > -1; i--) {
        if (chessBoard[row][i]) {
          const nextCol = getColor([row,i])
          if (nextCol != pieceColor) {
            possibleMoves.push([row,i])
            break
          } else{
            break
          }
        } else {
          possibleMoves.push([row,i])
        }
      }
      for (let i = right; i < 8; i++) {
        if (chessBoard[row][i]) {
          const nextCol = getColor([row,i])
          if (nextCol != pieceColor) {
            possibleMoves.push([row,i])
            break
          } else{
            break
          }
        } else {
          possibleMoves.push([row,i])
        }
      }
    } else if (pieceType == "knight") {
        const forwardRow2 = row + 2 * directionMultiplier;
        const backwardRow2 = row - 2 * directionMultiplier;
        const forwardRow1 = row + 1 * directionMultiplier;
        const backwardRow1 = row - 1 * directionMultiplier;
        const leftCol1 = col - 1;
        const leftCol2 = col - 2;
        const rightCol1 = col + 1;
        const rightCol2 = col + 2;

        if (isValidPosition(forwardRow2, leftCol1)) {
          if (chessBoard[forwardRow2][leftCol1]) {
            const nextCol = getColor([forwardRow2, leftCol1]);
            if (nextCol != pieceColor) {
              possibleMoves.push([forwardRow2, leftCol1]);
            }
          } else {
            possibleMoves.push([forwardRow2, leftCol1]);
          }
        }

        if (isValidPosition(forwardRow2, rightCol1)) {
          if (chessBoard[forwardRow2][rightCol1]) {
            const nextCol = getColor([forwardRow2, rightCol1]);
            if (nextCol != pieceColor) {
              possibleMoves.push([forwardRow2, rightCol1]);
            }
          } else {
            possibleMoves.push([forwardRow2, rightCol1]);
          }
        }

        if (isValidPosition(backwardRow2, leftCol1)) {
          if (chessBoard[backwardRow2][leftCol1]) {
            const nextCol = getColor([backwardRow2, leftCol1]);
            if (nextCol != pieceColor) {
              possibleMoves.push([backwardRow2, leftCol1]);
            }
          } else {
            possibleMoves.push([backwardRow2, leftCol1]);
          }
        }

        if (isValidPosition(backwardRow2, rightCol1)) {
          if (chessBoard[backwardRow2][rightCol1]) {
            const nextCol = getColor([backwardRow2, rightCol1]);
            if (nextCol != pieceColor) {
              possibleMoves.push([backwardRow2, rightCol1]);
            }
          } else {
            possibleMoves.push([backwardRow2, rightCol1]);
          }
        }

        if (isValidPosition(forwardRow1, leftCol2)) {
          if (chessBoard[forwardRow1][leftCol2]) {
            const nextCol = getColor([forwardRow1, leftCol2]);
            if (nextCol != pieceColor) {
              possibleMoves.push([forwardRow1, leftCol2]);
            }
          } else {
            possibleMoves.push([forwardRow1, leftCol2]);
          }
        }

        if (isValidPosition(forwardRow1, rightCol2)) {
          if (chessBoard[forwardRow1][rightCol2]) {
            const nextCol = getColor([forwardRow1, rightCol2]);
            if (nextCol != pieceColor) {
              possibleMoves.push([forwardRow1, rightCol2]);
            }
          } else {
            possibleMoves.push([forwardRow1, rightCol2]);
          }
        }

        if (isValidPosition(backwardRow1, leftCol2)) {
          if (chessBoard[backwardRow1][leftCol2]) {
            const nextCol = getColor([backwardRow1, leftCol2]);
            if (nextCol != pieceColor) {
              possibleMoves.push([backwardRow1, leftCol2]);
            }
          } else {
            possibleMoves.push([backwardRow1, leftCol2]);
          }
        }

        if (isValidPosition(backwardRow1, rightCol2)) {
          if (chessBoard[backwardRow1][rightCol2]) {
            const nextCol = getColor([backwardRow1, rightCol2]);
            if (nextCol != pieceColor) {
              possibleMoves.push([backwardRow1, rightCol2]);
            }
          } else {
            possibleMoves.push([backwardRow1, rightCol2]);
          }
        }
    } else if (pieceType == "bishop") {
      const forwardLeft = [row - 1, col - 1]
      const forwardRight = [row - 1, col + 1]
      const backwardLeft = [row + 1, col - 1]
      const backwardRight = [row + 1, col + 1]
      for (let i = forwardLeft[0], j = forwardLeft[1]; i > -1 && j > -1; i--, j--) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
      for (let i = forwardRight[0], j = forwardRight[1]; i > -1 && j < 8; i--, j++) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
      for (let i = backwardLeft[0], j = backwardLeft[1]; i < 8 && j > -1; i++, j--) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
      for (let i = backwardRight[0], j = backwardRight[1]; i < 8 && j < 8; i++, j++) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
    } else if (pieceType == "queen") {
      const forwardLeft = [row - 1, col - 1]
      const forwardRight = [row - 1, col + 1]
      const backwardLeft = [row + 1, col - 1]
      const backwardRight = [row + 1, col + 1]
      const forward = row-1
      const backward = row + 1
      const left = col - 1
      const right = col + 1
      for (let i = forward; i > -1; i--) {
        if (chessBoard[i][col]) {
          const nextCol = getColor([i,col])
          if (nextCol != pieceColor) {
            possibleMoves.push([i,col])
            break
          } else {
            break
          }
        } else {
          possibleMoves.push([i,col])
        }
      }
      for (let i = backward; i < 8; i++) {
        if (chessBoard[i][col]) {
          const nextCol = getColor([i,col])
          if (nextCol != pieceColor) {
            possibleMoves.push([i,col])
            break
          } else{
            break
          }
        } else {
          possibleMoves.push([i,col])
        }
      }
      for (let i = left; i > -1; i--) {
        if (chessBoard[row][i]) {
          const nextCol = getColor([row,i])
          if (nextCol != pieceColor) {
            possibleMoves.push([row,i])
            break
          } else{
            break
          }
        } else {
          possibleMoves.push([row,i])
        }
      }
      for (let i = right; i < 8; i++) {
        if (chessBoard[row][i]) {
          const nextCol = getColor([row,i])
          if (nextCol != pieceColor) {
            possibleMoves.push([row,i])
            break
          } else{
            break
          }
        } else {
          possibleMoves.push([row,i])
        }
      }
      for (let i = forwardLeft[0], j = forwardLeft[1]; i > -1 && j > -1; i--, j--) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
      for (let i = forwardRight[0], j = forwardRight[1]; i > -1 && j < 8; i--, j++) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
      for (let i = backwardLeft[0], j = backwardLeft[1]; i < 8 && j > -1; i++, j--) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
      for (let i = backwardRight[0], j = backwardRight[1]; i < 8 && j < 8; i++, j++) {
        if (isValidPosition(i,j)) {
          if (chessBoard[i][j]) {
            const nextCol = getColor([i,j])
            if (nextCol != pieceColor) {
              possibleMoves.push([i,j])
              break
            } else {
              break
            }
          } else {
            possibleMoves.push([i,j])
          }
        }
      }
    } else if (pieceType == "king") {
      const forwardLeft = [row - 1, col - 1]
      const forwardRight = [row - 1, col + 1]
      const backwardLeft = [row + 1, col - 1]
      const backwardRight = [row + 1, col + 1]
      const forward = row-1
      const backward = row + 1
      const left = col - 1
      const right = col + 1
      if (isValidPosition(forwardLeft[0],forwardLeft[1])) {
        if (chessBoard[forwardLeft[0]][forwardLeft[1]]) {
          const nextCol = getColor([forwardLeft[0],forwardLeft[1]])
          if (nextCol != pieceColor) {
            possibleMoves.push([forwardLeft[0],forwardLeft[1]])
          }
        } else {
          possibleMoves.push([forwardLeft[0],forwardLeft[1]])
        }
      }
      if (isValidPosition(forwardRight[0],forwardRight[1])) {
        if (chessBoard[forwardRight[0]][forwardRight[1]]) {
          const nextCol = getColor([forwardRight[0],forwardRight[1]])
          if (nextCol != pieceColor) {
            possibleMoves.push([forwardRight[0],forwardRight[1]])
          }
        } else {
          possibleMoves.push([forwardRight[0],forwardRight[1]])
        }
      }
      if (isValidPosition(backwardLeft[0],backwardLeft[1])) {
        if (chessBoard[backwardLeft[0]][backwardLeft[1]]) {
          const nextCol = getColor([backwardLeft[0],backwardLeft[1]])
          if (nextCol != pieceColor) {
            possibleMoves.push([backwardLeft[0],backwardLeft[1]])
          }
        } else {
          possibleMoves.push([backwardLeft[0],backwardLeft[1]])
        }
      }
      if (isValidPosition(backwardRight[0],backwardRight[1])) {
        if (chessBoard[backwardRight[0]][backwardRight[1]]) {
          const nextCol = getColor([backwardRight[0],backwardRight[1]])
          if (nextCol != pieceColor) {
            possibleMoves.push([backwardRight[0],backwardRight[1]])
          }
        } else {
          possibleMoves.push([backwardRight[0],backwardRight[1]])
        }
      }
      if (isValidPosition(forward,col)) {
        if (chessBoard[forward][col]) {
          const nextCol = getColor([forward,col])
          if (nextCol != pieceColor) {
            possibleMoves.push([forward,col])
          }
        } else {
          possibleMoves.push([forward,col])
        }
      }
      if (isValidPosition(backward,col)) {
        if (chessBoard[backward][col]) {
          const nextCol = getColor([backward,col])
          if (nextCol != pieceColor) {
            possibleMoves.push([backward,col])
          }
        } else {
          possibleMoves.push([backward,col])
        }
      }
      if (isValidPosition(row,left)) {
        if (chessBoard[row][left]) {
          const nextCol = getColor([row,left])
          if (nextCol != pieceColor) {
            possibleMoves.push([row,left])
          }
        } else {
          possibleMoves.push([row,left])
        }
      }
      if (isValidPosition(row,right)) {
        if (chessBoard[row][right]) {
          const nextCol = getColor([row,right])
          if (nextCol != pieceColor) {
            possibleMoves.push([row,right])
          }
        } else {
          possibleMoves.push([row,right])
        }
      }
    }
    setLegalMove(possibleMoves)
    selectedPieceCopy.push([pieceType,[row,col]])
    setSelectedPiece(selectedPieceCopy)
  }

  const pieceClick = (key) => {
    const row = parseInt(key[0]);
    const col = parseInt(key[2]);
    const boardCopy = chessBoard.map(row => [...row]);
    const blackPiecesCopy = [...blackPieces];
    const whitePiecesCopy = [...whitePieces];

    if (selectedPiece.length !== 0) {
      if (isLegal(row, col)) {
        const [pieceType, [fromRow, fromCol]] = selectedPiece[0];
        const selectedColor = getColor([fromRow, fromCol]);
        const destinationPiece = chessBoard[row][col];

        if (destinationPiece) {
          const targetColor = getColor([row, col]);
          if (selectedColor !== targetColor) {
            if (targetColor === "white") {
              whitePiecesCopy.push(destinationPiece[0]);
              setWhitePieces(whitePiecesCopy);
            } else {
              blackPiecesCopy.push(destinationPiece[0]);
              setBlackPieces(blackPiecesCopy);
            }
            boardCopy[fromRow][fromCol][1] += 1;
            boardCopy[row][col] = boardCopy[fromRow][fromCol];
            boardCopy[fromRow][fromCol] = "";
          }
        } else {
          boardCopy[fromRow][fromCol][1] += 1;
          boardCopy[row][col] = boardCopy[fromRow][fromCol];
          boardCopy[fromRow][fromCol] = "";
        }

        setChessBoard(boardCopy);
        setLegalMove([]);
        setSelectedPiece([]);
        setTurn(selectedColor === "white" ? "black" : "white");
        return;
      } else {
        setSelectedPiece([]);
        setLegalMove([]);
      }
    }
    if (chessBoard[row][col]) {
      const pieceColor = getColor([row, col]);
      const pieceType = getType([row, col]);
      if (pieceColor === turn) {
        getLegalMoves(pieceColor, pieceType, row, col);
      }
    }
  };


  const isLegal = (row,col) => {
    const exists = legalMove.some(([a,b])=>a===row&&b===col)
    return exists
  }


  return (
    <div className="flex justify-evenly items-center min-h-screen gap-6">
      <ul className="whitePieces border-2 border-black grid grid-cols-2 grid-rows-8 w-80 min-h-250 bg-yellow-200 place-items-center">
        {whitePieces.map((piece, pieceIndex) => (
          <li key={pieceIndex} className="w-30 flex items-center justify-center">{piece}</li>
        ))}
      </ul>
      <ul className="chessBox border-8 border-black w-250 h-250 grid grid-cols-8 grid-rows-8">
        {chessBoard.map((chessRow, rowIndex) => (
          chessRow.map((cell, colIndex) => (
            <li
              key={`r${rowIndex}c${colIndex}`}
              className={`w-full h-full flex items-center justify-center border ${
                isLegal(rowIndex, colIndex)
                  ? chessBoard[rowIndex][colIndex] ? "bg-red-600" : "bg-white"
                  : (colIndex + rowIndex) % 2 === 0
                  ? "bg-yellow-200"
                  : "bg-yellow-800"
              }`}
              onClick={() => pieceClick(`${rowIndex}-${colIndex}`)}
            >
              {cell?cell[0]:cell}
            </li>
          ))
        ))}
      </ul>
      <ul className="blackPieces border-2 border-black grid grid-cols-2 grid-rows-8 w-80 min-h-250 bg-yellow-800 place-items-center">
        {blackPieces.map((piece, pieceIndex) => (
          <li key={pieceIndex} className="w-30 flex items-center justify-center">{piece}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
