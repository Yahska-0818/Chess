const gameRouter = require('express').Router();
const mongoose = require('mongoose');

const { Game, Piece, PieceDefinition, User } = require('../models.js');
const gameLogic = require('../logic/gameLogic.js');
const notationLogic = require('../logic/notation.js');

class SimpleLRU {
  constructor({ max = 10000, ttl = 1000 * 60 * 5 } = {}) {
    this.max = max;
    this.ttl = ttl;
    this.map = new Map();
  }
  _evictIfNeeded() {
    while (this.map.size > this.max) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
  }
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.map.delete(key);
      return undefined;
    }

    this.map.delete(key);
    this.map.set(key, entry);
    return entry.val;
  }
  set(key, val) {
    const expiresAt = this.ttl ? Date.now() + this.ttl : null;
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { val, expiresAt });
    this._evictIfNeeded();
  }
  del(key) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

const buildBoardFromPieces = (pieces) => {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (const piece of pieces) {
    if (!piece.isCaptured) {
      board[piece.currentPosition.row][piece.currentPosition.col] = {
        pieceId: piece._id,
        defId: piece.definitionId,
        color: piece.color,
        type: piece.type,
        moveCounter: piece.moveCounter
      };
    }
  }
  return board;
};

const getCapturedPiecesFromPieces = (pieces) => {
  const captured = { white: [], black: [] };
  for (const piece of pieces) {
    if (piece.isCaptured) {
      captured[piece.color].push({ color: piece.color, type: piece.type });
    }
  }
  return captured;
};

const getCapturedPiecesFromBoard = (board) => {
  return { white: [], black: [] };
};

const formatGameState = (gameObj, piecesArrayLike) => {
  const board = Array.isArray(gameObj.board) ? gameObj.board : (piecesArrayLike ? buildBoardFromPieces(piecesArrayLike) : makeEmptyBoard());
  const captured = piecesArrayLike ? getCapturedPiecesFromPieces(piecesArrayLike) : getCapturedPiecesFromBoard(board);
  const kingPos = gameLogic.isKingInCheck(gameObj.turn, board, gameObj.enPassantTarget);

  return {
    _id: gameObj._id,
    status: gameObj.status,
    turn: gameObj.turn,
    winner: gameObj.winner,
    inCheck: kingPos,
    enPassantTarget: gameObj.enPassantTarget,
    captured,
    board,
    moveHistory: gameObj.moveHistory || []
  };
};

function makeEmptyBoard() {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function placeFromDefinitions(board, definitions) {
  for (const def of definitions) {
    for (const pos of def.startingPositions) {
      board[pos.row][pos.col] = {
        defId: def._id,
        color: def.color,
        type: def.type,
        moveCounter: def.defaultMoveCounter || 0
      };
    }
  }
  return board;
}

async function ensureBoardForGame(game) {
  if (game.board && Array.isArray(game.board)) return game.board;
  const pieces = await Piece.find({ gameId: game._id }).lean();
  return buildBoardFromPieces(pieces);
}

const moveCache = new SimpleLRU({ max: 10000, ttl: 1000 * 60 * 5 });
function makeMovesCacheKey(gameId, board, row, col, turn, enPassant) {
  return `${gameId}|${row},${col}|${turn}|${JSON.stringify(enPassant)}|${JSON.stringify(board)}`;
}

gameRouter.post('/', async (request, response) => {
  try {
    let whitePlayer = await User.findOne({ username: 'player1' }).lean();
    if (!whitePlayer) {
      const wp = await new User({ username: 'player1' }).save();
      whitePlayer = wp.toObject();
    }

    const definitions = await PieceDefinition.find({}).lean();

    const piecesToCreate = [];
    for (const def of definitions) {
      for (const pos of def.startingPositions) {
        piecesToCreate.push({
          definitionId: def._id,
          color: def.color,
          type: def.type,
          currentPosition: { row: pos.row, col: pos.col },
          moveCounter: def.defaultMoveCounter || 0,
          isCaptured: false
        });
      }
    }

    const newGame = new Game({
      whitePlayerId: whitePlayer._id,
      blackPlayerId: null,
      status: 'in_progress',
      turn: 'white',
      enPassantTarget: null,
      moveHistory: [],
      promotionData: null,
      board: makeEmptyBoard()
    });
    await newGame.save();

    const piecesWithGame = piecesToCreate.map(p => ({ ...p, gameId: newGame._id }));
    const inserted = piecesWithGame.length ? await Piece.insertMany(piecesWithGame) : [];

    const board = makeEmptyBoard();
    for (const p of inserted) {
      if (!p.isCaptured) {
        const r = p.currentPosition.row;
        const c = p.currentPosition.col;
        board[r][c] = {
          pieceId: p._id,
          defId: p.definitionId,
          color: p.color,
          type: p.type,
          moveCounter: p.moveCounter || 0
        };
      }
    }

    newGame.board = board;
    await newGame.save();

    const piecesForResponse = inserted.map(p => ({
      _id: p._id,
      definitionId: p.definitionId,
      color: p.color,
      type: p.type,
      currentPosition: p.currentPosition,
      moveCounter: p.moveCounter || 0,
      isCaptured: p.isCaptured || false
    }));

    response.status(201).json(formatGameState(newGame.toObject(), piecesForResponse));
  } catch (err) {
    console.error('create game error:', err);
    response.status(500).json({ error: 'Failed to create game' });
  }
});

gameRouter.get('/:id/moves/:row/:col', async (request, response) => {
  try {
    const { id, row, col } = request.params;
    console.time('gameAndBoardLoad');

    const game = await Game.findById(id).lean();
    if (!game) return response.status(404).json({ error: 'Game not found' });

    const board = await ensureBoardForGame(game);

    console.timeEnd('gameAndBoardLoad');

    const numRow = parseInt(row, 10);
    const numCol = parseInt(col, 10);

    const piece = board?.[numRow]?.[numCol];
    if (!piece) return response.status(400).json({ error: 'No piece at position' });
    if (piece.color !== game.turn) return response.status(400).json({ error: "It's not your turn" });

    const cacheKey = makeMovesCacheKey(id, board, numRow, numCol, game.turn, game.enPassantTarget);
    const cached = moveCache.get(cacheKey);
    if (cached) return response.json(cached);

    const moves = gameLogic.getLegalMoves(
      piece.color,
      piece.type,
      numRow,
      numCol,
      board,
      game.enPassantTarget
    );

    moveCache.set(cacheKey, moves);
    response.json(moves);
  } catch (err) {
    console.error('get moves error:', err);
    response.status(500).json({ error: 'Failed to get moves' });
  }
});

gameRouter.post('/:id/move', async (request, response) => {
  try {
    const { id } = request.params;
    const { from, to } = request.body;

    if (!Array.isArray(from) || !Array.isArray(to)) return response.status(400).json({ error: 'Invalid coordinates' });

    const game = await Game.findById(id);
    if (!game) return response.status(404).json({ error: 'Game not found' });
    if (game.status !== 'in_progress') return response.status(400).json({ error: 'Game is not in progress' });

    let board = game.board;
    if (!Array.isArray(board)) {
      const pieces = await Piece.find({ gameId: game._id }).lean();
      board = buildBoardFromPieces(pieces);
    }

    const fromRow = parseInt(from[0], 10), fromCol = parseInt(from[1], 10);
    const toRow = parseInt(to[0], 10), toCol = parseInt(to[1], 10);
    const pieceToMove = board?.[fromRow]?.[fromCol];
    if (!pieceToMove) return response.status(400).json({ error: 'No piece at from position' });
    if (pieceToMove.color !== game.turn) return response.status(400).json({ error: "It's not your turn" });

    const cacheKey = makeMovesCacheKey(game._id.toString(), board, fromRow, fromCol, game.turn, game.enPassantTarget);
    let legalMoves = moveCache.get(cacheKey);
    if (!legalMoves) {
      legalMoves = gameLogic.getLegalMoves(pieceToMove.color, pieceToMove.type, fromRow, fromCol, board, game.enPassantTarget);
      moveCache.set(cacheKey, legalMoves);
    }
    const isMoveLegal = legalMoves.some(([r, c]) => r === toRow && c === toCol);
    if (!isMoveLegal) return response.status(400).json({ error: 'Illegal move' });

    const [newBoard, newEnPassantTarget, capturedInfo, isEnPassantCapture] = gameLogic.simulateMove(
      board, [fromRow, fromCol], [toRow, toCol], pieceToMove.type, game.enPassantTarget
    );

    const opponentColor = game.turn === 'white' ? 'black' : 'white';
    const kingPos = gameLogic.isKingInCheck(opponentColor, newBoard, newEnPassantTarget);
    const opponentHasLegalMoves = gameLogic.doesPlayerHaveLegalMoves(opponentColor, newBoard, newEnPassantTarget);
    const isCheck = !!kingPos;
    const isCheckmate = isCheck && !opponentHasLegalMoves;

    const notation = notationLogic.getAlgebraicNotation({
      piece: pieceToMove,
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      isCapture: !!capturedInfo,
      isEnPassant: !!isEnPassantCapture,
      promotion: null,
      castling: (pieceToMove.type === 'king' && Math.abs(fromCol - toCol) === 2) ? (toCol > fromCol ? 'kingside' : 'queenside') : null,
      isCheck,
      isCheckmate
    });

    let winner = null;
    let status = 'in_progress';
    if (isCheckmate) {
      winner = game.turn;
      status = 'completed';
    } else if (!isCheck && !opponentHasLegalMoves) {
      winner = 'Stalemate';
      status = 'completed';
    }

    const bulkOps = [];

    const movingPieceId = pieceToMove.pieceId || pieceToMove._id || null;
    if (movingPieceId) {
      bulkOps.push({
        updateOne: {
          filter: { _id: movingPieceId },
          update: { $set: { 'currentPosition.row': toRow, 'currentPosition.col': toCol }, $inc: { moveCounter: 1 } }
        }
      });
    } else {
      bulkOps.push({
        updateOne: {
          filter: { gameId: game._id, 'currentPosition.row': fromRow, 'currentPosition.col': fromCol, isCaptured: false },
          update: { $set: { 'currentPosition.row': toRow, 'currentPosition.col': toCol }, $inc: { moveCounter: 1 } }
        }
      });
    }

    if (capturedInfo && capturedInfo.pos && capturedInfo.pieceId) {
      bulkOps.push({
        updateOne: {
          filter: { _id: capturedInfo.pieceId },
          update: { $set: { isCaptured: true } }
        }
      });
    } else if (capturedInfo && capturedInfo.pos) {
      bulkOps.push({
        updateOne: {
          filter: { gameId: game._id, 'currentPosition.row': capturedInfo.pos.row, 'currentPosition.col': capturedInfo.pos.col, isCaptured: false },
          update: { $set: { isCaptured: true } }
        }
      });
    }

    if (pieceToMove.type === 'king' && Math.abs(fromCol - toCol) === 2) {
      const rookFromCol = toCol > fromCol ? 7 : 0;
      const rookToCol = toCol > fromCol ? 5 : 3;
      const rookCell = board[fromRow][rookFromCol];
      if (rookCell && (rookCell.pieceId || rookCell._id)) {
        bulkOps.push({
          updateOne: {
            filter: { _id: (rookCell.pieceId || rookCell._id) },
            update: { $set: { 'currentPosition.row': fromRow, 'currentPosition.col': rookToCol }, $inc: { moveCounter: 1 } }
          }
        });
      } else {
        bulkOps.push({
          updateOne: {
            filter: { gameId: game._id, 'currentPosition.row': fromRow, 'currentPosition.col': rookFromCol, isCaptured: false },
            update: { $set: { 'currentPosition.row': fromRow, 'currentPosition.col': rookToCol }, $inc: { moveCounter: 1 } }
          }
        });
      }
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Game.updateOne(
          { _id: game._id },
          {
            $set: {
              board: newBoard,
              enPassantTarget: newEnPassantTarget,
              turn: opponentColor,
              winner,
              status,
              promotionData: null
            },
            $push: {
              moveHistory: {
                piece: `${pieceToMove.color}_${pieceToMove.type}`,
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                notation
              }
            }
          },
          { session }
        );

        if (bulkOps.length) {
          await Piece.bulkWrite(bulkOps, { session });
        }
      });
    } catch (err) {
      session.endSession();
      console.error('transaction error:', err);
      return response.status(500).json({ error: 'Failed to apply move' });
    }
    session.endSession();

    const gameObj = {
      _id: game._id,
      status,
      turn: opponentColor,
      winner,
      enPassantTarget: newEnPassantTarget,
      board: newBoard,
      moveHistory: [...(game.moveHistory || []), {
        piece: `${pieceToMove.color}_${pieceToMove.type}`,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        notation
      }]
    };

    const piecesForResponse = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = newBoard[r][c];
        if (p) {
          piecesForResponse.push({
            _id: p.pieceId || p._id || null,
            definitionId: p.defId || null,
            color: p.color,
            type: p.type,
            currentPosition: { row: r, col: c },
            moveCounter: p.moveCounter || 0,
            isCaptured: false
          });
        }
      }
    }

    return response.json(formatGameState(gameObj, piecesForResponse));
  } catch (err) {
    console.error('move endpoint error:', err);
    return response.status(500).json({ error: 'Failed to process move' });
  }
});

gameRouter.post('/:id/promote', async (request, response) => {
  try {
    const { id } = request.params;
    const { from, to, promoteToType } = request.body;

    const game = await Game.findById(id);
    if (!game || game.status !== 'awaiting_promotion') {
      return response.status(400).json({ error: 'Not awaiting promotion' });
    }

    const fromRow = parseInt(from[0], 10);
    const fromCol = parseInt(from[1], 10);
    const toRow = parseInt(to[0], 10);
    const toCol = parseInt(to[1], 10);
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
    }).lean();

    await Piece.findByIdAndUpdate(pawnPiece._id, {
      definitionId: newPieceDef._id,
      type: newPieceDef.type
    });

    const updatedPieces = await Piece.find({ gameId: game._id }).lean();
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
      isCheck,
      isCheckmate
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

    game.board = newBoard;
    await game.save();

    response.json(formatGameState(game.toObject(), updatedPieces));
  } catch (err) {
    console.error('promote error:', err);
    response.status(500).json({ error: 'Failed to promote pawn' });
  }
});

module.exports = gameRouter;