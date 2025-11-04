const gameRouter = require('express').Router();
const mongoose = require('mongoose');
const { Game, Piece, PieceDefinition, User } = require('../models.js');
const gameLogic = require('../logic/gameLogic.js');
const notationLogic = require('../logic/notation.js');

const buildBoardFromPieces = (pieces) => {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (const piece of pieces) {
    if (!piece.isCaptured) {
      board[piece.currentPosition.row][piece.currentPosition.col] = {
        _id: piece._id,
        defId: piece.definitionId,
        color: piece.color,
        type: piece.type,
        moveCounter: piece.moveCounter
      };
    }
  }
  return board;
};

const getCapturedPieces = (pieces) => {
  const captured = {
    white: [],
    black: []
  };
  for (const piece of pieces) {
    if (piece.isCaptured) {
      captured[piece.color].push({
        color: piece.color,
        type: piece.type
      });
    }
  }
  return captured;
};

const formatGameState = (game, pieces) => {
  const board = buildBoardFromPieces(pieces);
  const captured = getCapturedPieces(pieces);

  const kingPos = gameLogic.isKingInCheck(game.turn, board, game.enPassantTarget);

  return {
    _id: game._id,
    status: game.status,
    turn: game.turn,
    winner: game.winner,
    inCheck: kingPos,
    enPassantTarget: game.enPassantTarget,
    captured,
    board,
    moveHistory: game.moveHistory 
  };
};

gameRouter.post('/', async (request, response) => {
  let whitePlayer = await User.findOne({ username: 'player1' });
  if (!whitePlayer) whitePlayer = await new User({ username: 'player1' }).save();
  
  const newGame = new Game({
    whitePlayerId: whitePlayer._id,
    blackPlayerId: null,
    status: 'in_progress',
    turn: 'white',

    enPassantTarget: null,
    moveHistory: [],
    promotionData: null
  });
  
  const definitions = await PieceDefinition.find({});
  const piecesToCreate = [];

  for (const def of definitions) {
    for (const pos of def.startingPositions) {
      piecesToCreate.push({
        gameId: newGame._id,
        definitionId: def._id,
        color: def.color,
        type: def.type,
        currentPosition: { row: pos.row, col: pos.col },
        moveCounter: 0,
        isCaptured: false
      });
    }
  }
  
  await Piece.insertMany(piecesToCreate);
  await newGame.save();
  
  const allPieces = await Piece.find({ gameId: newGame._id });
  
  response.status(201).json(formatGameState(newGame, allPieces));
});

gameRouter.get('/:id/moves/:row/:col', async (request, response) => {
  const { id, row, col } = request.params;
  
  const game = await Game.findById(id);
  if (!game) return response.status(404).json({ error: 'Game not found' });
  
  const pieces = await Piece.find({ gameId: game._id });
  const board = buildBoardFromPieces(pieces);

  const numRow = parseInt(row, 10);
  const numCol = parseInt(col, 10);
  
  const piece = board[numRow][numCol];
  
  if (!piece) return response.status(400).json({ error: 'No piece at position' });
  if (piece.color !== game.turn) return response.status(400).json({ error: "It's not your turn" });

  const moves = gameLogic.getLegalMoves(
    piece.color, 
    piece.type, 
    numRow,
    numCol,
    board, 
    game.enPassantTarget
  );
  
  response.json(moves);
});

gameRouter.post('/:id/move', async (request, response) => {
  const { id } = request.params;
  const { from, to } = request.body;
  
  const game = await Game.findById(id);
  if (!game) return response.status(404).json({ error: 'Game not found' });
  if (game.status !== 'in_progress') return response.status(400).json({ error: 'Game is not in progress' });

  const pieces = await Piece.find({ gameId: game._id });
  const board = buildBoardFromPieces(pieces);
  
  const [fromRow, fromCol] = [parseInt(from[0], 10), parseInt(from[1], 10)];
  const [toRow, toCol] = [parseInt(to[0], 10), parseInt(to[1], 10)];
  const fromCoords = [fromRow, fromCol];
  const toCoords = [toRow, toCol];

  const pieceToMove = board[fromRow][fromCol];
  
  if (!pieceToMove) return response.status(400).json({ error: 'No piece at from position' });
  if (pieceToMove.color !== game.turn) return response.status(400).json({ error: "It's not your turn" });
  
  const legalMoves = gameLogic.getLegalMoves(pieceToMove.color, pieceToMove.type, fromRow, fromCol, board, game.enPassantTarget);
  const isMoveLegal = legalMoves.some(([r, c]) => r === toRow && c === toCol);
  
  if (!isMoveLegal) return response.status(400).json({ error: 'Illegal move' });

  const [newBoard, newEnPassantTarget, capturedPiece, isEnPassantCapture] = gameLogic.simulateMove(
    board, fromCoords, toCoords, pieceToMove.type, game.enPassantTarget
  );

  
  const movedPiece = newBoard[parseInt(toRow)][parseInt(toCol)];
  if (movedPiece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
    await Piece.findByIdAndUpdate(pieceToMove._id, {
      currentPosition: { row: toRow, col: toCol },
      moveCounter: pieceToMove.moveCounter + 1
    });

    game.status = 'awaiting_promotion';
    game.promotionData = { from: fromCoords, to: toCoords };
    await game.save();
    
    const tempPieces = await Piece.find({ gameId: game._id });
    
    return response.json({
      ...formatGameState(game, tempPieces),
      status: 'awaiting_promotion',
      promotionData: { from: fromCoords, to: toCoords }
    });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Piece.findByIdAndUpdate(pieceToMove._id, {
        currentPosition: { row: toRow, col: toCol },
        moveCounter: pieceToMove.moveCounter + 1
      }, { session });

      if (capturedPiece) {
        await Piece.findByIdAndUpdate(capturedPiece._id, {
          isCaptured: true
        }, { session });
      }
      
      const isKingCastle = pieceToMove.type === 'king' && Math.abs(fromCol - toCol) === 2;
      if (isKingCastle) {
        const rookCol = toCol > fromCol ? 7 : 0;
        const rookToCol = toCol > fromCol ? 5 : 3;
        const rook = board[fromRow][rookCol];
        await Piece.findByIdAndUpdate(rook._id, {
          currentPosition: { row: fromRow, col: rookToCol },
          moveCounter: rook.moveCounter + 1
        }, { session });
      }

      const opponentColor = game.turn === 'white' ? 'black' : 'white';
      const kingIsInCheck = gameLogic.isKingInCheck(opponentColor, newBoard, newEnPassantTarget);
      const opponentHasLegalMoves = gameLogic.doesPlayerHaveLegalMoves(opponentColor, newBoard, newEnPassantTarget);

      const isCheck = !!kingIsInCheck;
      const isCheckmate = isCheck && !opponentHasLegalMoves;
      let castling = null;
      if (isKingCastle) castling = toCol > fromCol ? 'kingside' : 'queenside';

      if (isCheckmate) {
        game.winner = game.turn;
        game.status = 'completed';
      } else if (!isCheck && !opponentHasLegalMoves) {
        game.winner = 'Stalemate';
        game.status = 'completed';
      }

      const notation = notationLogic.getAlgebraicNotation({
        piece: pieceToMove,
        from: fromCoords,
        to: toCoords,
        isCapture: !!capturedPiece,
        isEnPassant: isEnPassantCapture,
        promotion: null,
        castling: castling,
        isCheck: isCheck,
        isCheckmate: isCheckmate
      });
      
      game.turn = opponentColor;
      game.enPassantTarget = newEnPassantTarget;
      game.moveHistory.push({
        piece: `${pieceToMove.color}_${pieceToMove.type}`,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        notation: notation
      });
      await game.save({ session });
    });
  } catch (error) {
    session.endSession();
    throw error;
  }
  session.endSession();

  const finalPieces = await Piece.find({ gameId: game._id });
  response.json(formatGameState(game, finalPieces));
});

gameRouter.post('/:id/promote', async (request, response) => {
  const { id } = request.params;
  const { from, to, promoteToType } = request.body; 
  
  const game = await Game.findById(id);
  if (!game || game.status !== 'awaiting_promotion') {
    return response.status(400).json({ error: 'Not awaiting promotion' });
  }

  const [fromRow, fromCol] = [parseInt(from[0], 10), parseInt(from[1], 10)];
  const [toRow, toCol] = [parseInt(to[0], 10), parseInt(to[1], 10)];
  const fromCoords = [fromRow, fromCol];
  const toCoords = [toRow, toCol];
  
  const pawnPiece = await Piece.findOne({ 
    gameId: game._id, 
    'currentPosition.row': toRow, 
    'currentPosition.col': toCol 
  });

  if (!pawnPiece || pawnPiece.type !== 'pawn') {
    return response.status(400).json({ error: 'Pawn not found at promotion square' });
  }

  const newPieceDef = await PieceDefinition.findOne({
    color: pawnPiece.color,
    type: promoteToType
  });

  await Piece.findByIdAndUpdate(pawnPiece._id, {
    definitionId: newPieceDef._id,
    type: newPieceDef.type
  });
  
  const updatedPieces = await Piece.find({ gameId: game._id });
  const newBoard = buildBoardFromPieces(updatedPieces);
  const opponentColor = game.turn === 'white' ? 'black' : 'white';
  
  const kingIsInCheck = gameLogic.isKingInCheck(opponentColor, newBoard, null);
  const opponentHasLegalMoves = gameLogic.doesPlayerHaveLegalMoves(opponentColor, newBoard, null);
  
  const isCheck = !!kingIsInCheck;
  const isCheckmate = isCheck && !opponentHasLegalMoves;

  if (isCheckmate) {
    game.winner = game.turn;
    game.status = 'completed';
  } else if (!isCheck && !opponentHasLegalMoves) {
    game.winner = 'Stalemate';
    game.status = 'completed';
  } else {
    game.status = 'in_progress';
  }
  
  const capturedPieceOnPromotion = await Piece.findOne({
    gameId: game._id,
    'currentPosition.row': toRow,
    'currentPosition.col': toCol,
    isCaptured: true 
  });

  const notation = notationLogic.getAlgebraicNotation({
      piece: { type: 'pawn', color: pawnPiece.color },
      from: fromCoords,
      to: toCoords,
      isCapture: !!capturedPieceOnPromotion,
      isEnPassant: false,
      promotion: promoteToType,
      castling: null,
      isCheck: isCheck,
      isCheckmate: isCheckmate
  });

  game.turn = opponentColor;
  game.enPassantTarget = null;
  game.promotionData = undefined;

  const lastMoveIndex = game.moveHistory.length - 1;
  if (lastMoveIndex >= 0) {
    game.moveHistory[lastMoveIndex].notation = notation;
  } else {
    game.moveHistory.push({
      piece: `${pawnPiece.color}_pawn`,
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      notation: notation
    });
  }

  await game.save();
  
  response.json(formatGameState(game, updatedPieces));
});

module.exports = gameRouter;
