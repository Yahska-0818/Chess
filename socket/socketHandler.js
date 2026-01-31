const { Chess } = require('chess.js');
const Game = require('../models/Game');

const activeGames = new Map(); 

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    socket.on('join_game', async (gameId) => {
      const roomName = `game:${gameId}`;
      socket.join(roomName);

      let gameState = activeGames.get(gameId);

      if (!gameState) {
        let dbGame = await Game.findById(gameId);
        
        if (dbGame) {
          gameState = {
            fen: dbGame.fen,
            pgn: dbGame.pgn,
            turn: dbGame.turn,
            whitePlayer: dbGame.whitePlayer,
            blackPlayer: dbGame.blackPlayer,
            isGameOver: dbGame.isGameOver,
            winner: dbGame.winner,
            history: []
          };
          activeGames.set(gameId, gameState);
        } else {
          await Game.create({ _id: gameId });
          
          gameState = {
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
            pgn: '',
            turn: 'w',
            whitePlayer: null,
            blackPlayer: null,
            isGameOver: false,
            winner: null
          };
          activeGames.set(gameId, gameState);
        }
      }

      let needsSave = false;
      if (!gameState.whitePlayer) {
        gameState.whitePlayer = socket.id;
        needsSave = true;
      } else if (!gameState.blackPlayer && gameState.whitePlayer !== socket.id) {
        gameState.blackPlayer = socket.id;
        needsSave = true;
      }

      if (needsSave) {
        activeGames.set(gameId, gameState);
        Game.findByIdAndUpdate(gameId, { 
          whitePlayer: gameState.whitePlayer, 
          blackPlayer: gameState.blackPlayer 
        }).exec();
      }

      const role = socket.id === gameState.whitePlayer ? 'w' : 
                   socket.id === gameState.blackPlayer ? 'b' : 'spectator';

      socket.emit('game_state', { ...gameState, role });
    });

    socket.on('make_move', async ({ gameId, from, to, promotion }) => {
      const gameState = activeGames.get(gameId);
      if (!gameState || gameState.isGameOver) return;

      const chess = new Chess(gameState.fen);
      const move = chess.move({ from, to, promotion: promotion || 'q' });

      if (!move) return socket.emit('error', 'Invalid move');

      gameState.fen = chess.fen();
      gameState.pgn = chess.pgn();
      gameState.turn = chess.turn();
      gameState.lastMove = { from, to, san: move.san };

      if (chess.isGameOver()) {
        gameState.isGameOver = true;
        if (chess.isCheckmate()) gameState.winner = chess.turn() === 'w' ? 'b' : 'w';
        else if (chess.isDraw()) gameState.winner = 'draw';
      }

      activeGames.set(gameId, gameState);

      io.to(`game:${gameId}`).emit('board_update', {
        fen: gameState.fen,
        pgn: gameState.pgn,
        lastMove: gameState.lastMove,
        turn: gameState.turn,
        isGameOver: gameState.isGameOver,
        winner: gameState.winner
      });

      if (gameState.isGameOver) {
        await Game.findByIdAndDelete(gameId);
        
        setTimeout(() => activeGames.delete(gameId), 3600000);
      } else {
        Game.findByIdAndUpdate(gameId, {
          fen: gameState.fen,
          pgn: gameState.pgn,
          turn: gameState.turn,
          lastMove: gameState.lastMove
        }).exec();
      }
    });
    socket.on('send_chat', ({ gameId, text }) => {
      const roomName = `game:${gameId}`;
      const gameState = activeGames.get(gameId);
      let role = 'spectator';

      if (gameState) {
        if (socket.id === gameState.whitePlayer) role = 'w';
        else if (socket.id === gameState.blackPlayer) role = 'b';
      }

      io.to(roomName).emit('chat_message', {
        text,
        role,
        timestamp: Date.now()
      });
    });

    socket.on('disconnect', () => {
    });
  });
};

module.exports = socketHandler;