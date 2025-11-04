import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
});
export const User = mongoose.model('User', userSchema);

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
  iconSvg: {
    type: String,
    required: true
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

export const PieceDefinition = mongoose.model('PieceDefinition', pieceDefinitionSchema);

const pieceSchema = new mongoose.Schema({
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

export const Piece = mongoose.model('Piece', pieceSchema);

const gameSchema = new mongoose.Schema({
  whitePlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blackPlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting_for_opponent', 'in_progress', 'completed', 'aborted'],
    default: 'waiting_for_opponent',
  },
  turn: {
    type: String,
    enum: ['white', 'black'],
    default: 'white',
  },
  winner: {
    type: String,
    enum: [null, 'white', 'black', 'draw'],
    default: null,
  },
  moveHistory: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

export const Game = mongoose.model('Game', gameSchema);