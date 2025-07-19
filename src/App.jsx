import { useState } from "react";

const pieces = {
  "black": {
    "pawn": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-pawn w-fit h-fit"><title>chess-pawn</title><path d="M19 22H5V20H19V22M16 18H8L10.18 10H8V8H10.72L10.79 7.74C10.1 7.44 9.55 6.89 9.25 6.2C8.58 4.68 9.27 2.91 10.79 2.25C12.31 1.58 14.08 2.27 14.74 3.79C15.41 5.31 14.72 7.07 13.2 7.74L13.27 8H16V10H13.82L16 18Z" /></svg>,
      startingPosition: "r1"
    },
    "rook": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-rook w-fit h-fit"><title>chess-rook</title><path d="M5,20H19V22H5V20M17,2V5H15V2H13V5H11V2H9V5H7V2H5V8H7V18H17V8H19V2H17Z" /></svg>,
      startingPosition: ["r0c0","r0c7"]
    },
    "knight": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-knight w-fit h-fit"><title>chess-knight</title><path d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.8,9.59 12.69,10.3 12.22,10.77L7.42,15.57C6.87,16.13 6.87,17.03 7.43,17.58C7.69,17.84 8.05,18 8.42,18H17V6A4,4 0 0,0 13,2Z" /></svg>,
      startingPosition: ["r0c1","r0c6"]
    },
    "bishop": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-bishop w-fit h-fit"><title>chess-bishop</title><path d="M19,22H5V20H19V22M17.16,8.26C18.22,9.63 18.86,11.28 19,13C19,15.76 15.87,18 12,18C8.13,18 5,15.76 5,13C5,10.62 7.33,6.39 10.46,5.27C10.16,4.91 10,4.46 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.46 13.84,4.91 13.54,5.27C14.4,5.6 15.18,6.1 15.84,6.74L11.29,11.29L12.71,12.71L17.16,8.26Z" /></svg>,
      startingPosition: ["r0c2","r0c5"]
    },
    "queen": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-queen w-fit h-fit"><title>chess-queen</title><path d="M18,3A2,2 0 0,1 20,5C20,5.81 19.5,6.5 18.83,6.82L17,13.15V18H7V13.15L5.17,6.82C4.5,6.5 4,5.81 4,5A2,2 0 0,1 6,3A2,2 0 0,1 8,5C8,5.5 7.82,5.95 7.5,6.3L10.3,9.35L10.83,5.62C10.33,5.26 10,4.67 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.67 13.67,5.26 13.17,5.62L13.7,9.35L16.47,6.29C16.18,5.94 16,5.5 16,5A2,2 0 0,1 18,3M5,20H19V22H5V20Z" /></svg>,
      startingPosition: "r0c3"
    },
    "king": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-king w-fit h-fit"><title>chess-king</title><path d="M19,22H5V20H19V22M17,10C15.58,10 14.26,10.77 13.55,12H13V7H16V5H13V2H11V5H8V7H11V12H10.45C9.35,10.09 6.9,9.43 5,10.54C3.07,11.64 2.42,14.09 3.5,16C4.24,17.24 5.57,18 7,18H17A4,4 0 0,0 21,14A4,4 0 0,0 17,10Z" /></svg>,
      startingPosition: "r0c4"
    }
  },
  "white": {
    "pawn": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-pawn w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-pawn</title><path d="M19 22H5V20H19V22M16 18H8L10.18 10H8V8H10.72L10.79 7.74C10.1 7.44 9.55 6.89 9.25 6.2C8.58 4.68 9.27 2.91 10.79 2.25C12.31 1.58 14.08 2.27 14.74 3.79C15.41 5.31 14.72 7.07 13.2 7.74L13.27 8H16V10H13.82L16 18Z" /></svg>,
      startingPosition: "r6"
    },
    "rook": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-rook w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-rook</title><path d="M5,20H19V22H5V20M17,2V5H15V2H13V5H11V2H9V5H7V2H5V8H7V18H17V8H19V2H17Z" /></svg>,
      startingPosition: ["r7c0","r7c7"]
    },
    "knight": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-knight w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-knight</title><path d="M19,22H5V20H19V22M13,2V2C11.75,2 10.58,2.62 9.89,3.66L7,8L9,10L11.06,8.63C11.5,8.32 12.14,8.44 12.45,8.9C12.47,8.93 12.5,8.96 12.5,9V9C12.8,9.59 12.69,10.3 12.22,10.77L7.42,15.57C6.87,16.13 6.87,17.03 7.43,17.58C7.69,17.84 8.05,18 8.42,18H17V6A4,4 0 0,0 13,2Z" /></svg>,
      startingPosition: ["r7c1","r7c6"]
    },
    "bishop": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-bishop w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-bishop</title><path d="M19,22H5V20H19V22M17.16,8.26C18.22,9.63 18.86,11.28 19,13C19,15.76 15.87,18 12,18C8.13,18 5,15.76 5,13C5,10.62 7.33,6.39 10.46,5.27C10.16,4.91 10,4.46 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.46 13.84,4.91 13.54,5.27C14.4,5.6 15.18,6.1 15.84,6.74L11.29,11.29L12.71,12.71L17.16,8.26Z" /></svg>,
      startingPosition: ["r7c2","r7c5"]
    },
    "queen": {
      icon:<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-queen w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-queen</title><path d="M18,3A2,2 0 0,1 20,5C20,5.81 19.5,6.5 18.83,6.82L17,13.15V18H7V13.15L5.17,6.82C4.5,6.5 4,5.81 4,5A2,2 0 0,1 6,3A2,2 0 0,1 8,5C8,5.5 7.82,5.95 7.5,6.3L10.3,9.35L10.83,5.62C10.33,5.26 10,4.67 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.67 13.67,5.26 13.17,5.62L13.7,9.35L16.47,6.29C16.18,5.94 16,5.5 16,5A2,2 0 0,1 18,3M5,20H19V22H5V20Z" /></svg>,
      startingPosition: "r7c3"
    },
    "king": {
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="black-king w-fit h-fit" stroke="black" strokeWidth="1" fill="white"><title>chess-king</title><path d="M19,22H5V20H19V22M17,10C15.58,10 14.26,10.77 13.55,12H13V7H16V5H13V2H11V5H8V7H11V12H10.45C9.35,10.09 6.9,9.43 5,10.54C3.07,11.64 2.42,14.09 3.5,16C4.24,17.24 5.57,18 7,18H17A4,4 0 0,0 21,14A4,4 0 0,0 17,10Z" /></svg>,
      startingPosition: "r7c4"
    }
  }
}

const populateInitialBoard = (boardMatrix) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (row == pieces.black.pawn.startingPosition[1]) {
        boardMatrix[row][col] = pieces.black.pawn.icon
      } else if (row == pieces.white.pawn.startingPosition[1]) {
        boardMatrix[row][col] = pieces.white.pawn.icon
      } else if (row == pieces.black.king.startingPosition[1] && col == pieces.black.king.startingPosition[3]) {
        boardMatrix[row][col] = pieces.black.king.icon
      } else if (row == pieces.white.king.startingPosition[1] && col == pieces.white.king.startingPosition[3]) {
        boardMatrix[row][col] = pieces.white.king.icon
      } else if (row == pieces.black.queen.startingPosition[1] && col == pieces.black.queen.startingPosition[3]) {
        boardMatrix[row][col] = pieces.black.queen.icon
      } else if (row == pieces.white.queen.startingPosition[1] && col == pieces.white.queen.startingPosition[3]) {
        boardMatrix[row][col] = pieces.white.queen.icon
      } else if ((row == pieces.black.rook.startingPosition[0][1] && col == pieces.black.rook.startingPosition[0][3]) || (row == pieces.black.rook.startingPosition[1][1] && col == pieces.black.rook.startingPosition[1][3])) {
        boardMatrix[row][col] = pieces.black.rook.icon
      } else if ((row == pieces.white.rook.startingPosition[0][1] && col == pieces.white.rook.startingPosition[0][3]) || (row == pieces.white.rook.startingPosition[1][1] && col == pieces.white.rook.startingPosition[1][3])) {
        boardMatrix[row][col] = pieces.white.rook.icon
      } else if ((row == pieces.black.knight.startingPosition[0][1] && col == pieces.black.knight.startingPosition[0][3]) || (row == pieces.black.knight.startingPosition[1][1] && col == pieces.black.knight.startingPosition[1][3])) {
        boardMatrix[row][col] = pieces.black.knight.icon
      } else if ((row == pieces.white.knight.startingPosition[0][1] && col == pieces.white.knight.startingPosition[0][3]) || (row == pieces.white.knight.startingPosition[1][1] && col == pieces.white.knight.startingPosition[1][3])) {
        boardMatrix[row][col] = pieces.white.knight.icon
      } else if ((row == pieces.black.bishop.startingPosition[0][1] && col == pieces.black.bishop.startingPosition[0][3]) || (row == pieces.black.bishop.startingPosition[1][1] && col == pieces.black.bishop.startingPosition[1][3])) {
        boardMatrix[row][col] = pieces.black.bishop.icon
      }
      else if ((row == pieces.white.bishop.startingPosition[0][1] && col == pieces.white.bishop.startingPosition[0][3]) || (row == pieces.white.bishop.startingPosition[1][1] && col == pieces.white.bishop.startingPosition[1][3])) {
        boardMatrix[row][col] = pieces.white.bishop.icon
      }
    }
  }
  return boardMatrix
}


function App() {

  const [chessBoard,setChessBoard] = useState(Array.from({ length: 8 }, () => Array(8).fill()))

  const startGame = () => {
    const boardCopy = chessBoard.map(row => [...row])
    setChessBoard(populateInitialBoard(boardCopy))
  }

  const pieceClick = (key) => {
  const row = parseInt(key[0])
  const col = parseInt(key[2])
  const newRow = row + 2
  const newCol = col - 1
  const pieceIcon = chessBoard[row][col]
  const boardCopy = chessBoard.map(row => [...row])
  boardCopy[newRow][newCol] = pieceIcon
  boardCopy[row][col] = ""
  setChessBoard(boardCopy)
}


  return (
    <div className="flex justify-center items-center min-h-screen gap-6">
      <div className="buttons">
        <button onClick={() => startGame()} className="border-2 border-black p-4 rounded">Start</button>
      </div>
      <ul className="chessBox border-8 border-black w-250 h-250 grid grid-cols-8 grid-rows-8">
        {chessBoard.map((chessRow, rowIndex) => (
          chessRow.map((cell, colIndex) => (
            <li key={`r${rowIndex}c${colIndex}`} className={`w-full h-full flex items-center justify-center border ${(colIndex+rowIndex)%2===0?"bg-amber-100":"bg-yellow-800"}`} onClick={()=>pieceClick(`${rowIndex}-${colIndex}`)}>
              {cell}
            </li>
          ))
        ))}
      </ul>
    </div>
  )
}

export default App
