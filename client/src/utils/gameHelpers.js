export const getCapturedPieces = (fen) => {
  const captured = { w: [], b: [] };
  const allPieces = {
    p: 8, n: 2, b: 2, r: 2, q: 1, k: 1,
    P: 8, N: 2, B: 2, R: 2, Q: 1, K: 1
  };

  const boardString = fen.split(' ')[0];
  for (const char of boardString) {
    if (allPieces[char] !== undefined) {
      allPieces[char]--;
    }
  }

  const pieceMap = {
    p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen',
    P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen'
  };

  Object.keys(allPieces).forEach(char => {
    const count = allPieces[char];
    for (let i = 0; i < count; i++) {
      if (char === char.toLowerCase()) {
        captured.w.push({ type: pieceMap[char], color: 'b' }); 
      } else {
        captured.b.push({ type: pieceMap[char], color: 'w' });
      }
    }
  });

  return captured;
};