const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  _id: { type: String }, 
  
  whitePlayer: { type: String, default: null },
  blackPlayer: { type: String, default: null },
  fen: { type: String, default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' },
  pgn: { type: String, default: '' },
  turn: { type: String, default: 'w' },
  isGameOver: { type: Boolean, default: false },
  winner: { type: String, default: null },
  lastMove: { from: String, to: String, san: String }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);