const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});
const User = mongoose.model('User', userSchema);

const positionSchema = new mongoose.Schema({
  row: {
    type: Number,
    required: true
  },
  col: {
    type: Number,
    required: true
  }
}, { _id: false });

const pieceDefinitionSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
    enum: ['black', 'white']
  },
  type: {
    type: String,
    required: true,
    enum: ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']
  },
  startingPositions: {
    type: [positionSchema],
    required: true
  },
  defaultMoveCounter: {
    type: Number,
    default: 0
  }
});

pieceDefinitionSchema.index({ color: 1, type: 1 }, { unique: true });

const PieceDefinition = mongoose.model('PieceDefinition', pieceDefinitionSchema);

const capturedPieceSchema = new mongoose.Schema({
  color: { type: String, required: true },
  type: { type: String, required: true },
}, { _id: false });

const pieceSchemaV2 = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
    index: true
  },
  definitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PieceDefinition',
    required: true
  },
  color: {
    type: String,
    required: true,
    enum: ['black', 'white']
  },
  type: {
    type: String,
    required: true,
    enum: ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king']
  },
  currentPosition: {
    type: positionSchema,
    required: true
  },
  moveCounter: {
    type: Number,
    default: 0
  },
  isCaptured: {
    type: Boolean,
    default: false
  }
});
pieceSchemaV2.index({ gameId: 1, "currentPosition.row": 1, "currentPosition.col": 1 });
const Piece = mongoose.model('Piece', pieceSchemaV2);

const moveSchema = new mongoose.Schema({
  piece: { type: String, required: true },
  from: { type: positionSchema, required: true },
  to: { type: positionSchema, required: true },
  notation: { type: String, required: true }
}, { _id: false });

const gameSchema = new mongoose.Schema({
  whitePlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blackPlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['waiting_for_opponent', 'in_progress', 'awaiting_promotion', 'completed', 'aborted'],
    default: 'in_progress',
  },
  turn: {
    type: String,
    enum: ['white', 'black'],
    default: 'white',
  },
  winner: {
    type: String,
    enum: [null, 'white', 'black', 'Stalemate'],
    default: null,
  },
  moveHistory: {
    type: [moveSchema],
    default: [],
  },
  board: {
    type: [[mongoose.Schema.Types.Mixed]],
    required: true
  },
  inCheck: {
    type: [Number],
    default: null
  },
  enPassantTarget: {
    type: [Number],
    default: null
  },
  captured: {
    white: [capturedPieceSchema],
    black: [capturedPieceSchema]
  },
  promotionData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { timestamps: true });

gameSchema.index({ whitePlayerId: 1 });
gameSchema.index({ blackPlayerId: 1 });
gameSchema.index({ status: 1 });

const Game = mongoose.model('Game', gameSchema);

module.exports = {
  User,
  PieceDefinition,
  Piece,
  Game
};

