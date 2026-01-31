const { Chess } = require('chess.js');
const Game = require('../models/Game');
const redisClient = require('../config/redis');

const GAME_TTL = 3600;

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    const cacheGame = async (gameId, gameState) => {
      await redisClient.set(`game:${gameId}`, JSON.stringify(gameState), {
        EX: GAME_TTL
      });
    };

    socket.on('join_game', async (gameId) => {
      try {
        const roomName = `game:${gameId}`;
        socket.join(roomName);

        let cachedGame = await redisClient.get(roomName);
        let gameState;

        if (cachedGame) {
          gameState = JSON.parse(cachedGame);
        } else {
          let dbGame = await Game.findById(gameId);
          
          if (!dbGame) {
            dbGame = await Game.create({ _id: gameId });
          }
          gameState = {
            fen: dbGame.fen,
            pgn: dbGame.pgn,
            turn: dbGame.turn,
            whitePlayer: dbGame.whitePlayer,
            blackPlayer: dbGame.blackPlayer,
            lastMove: dbGame.lastMove,
            isGameOver: dbGame.isGameOver,
            winner: dbGame.winner
          };

          await cacheGame(gameId, gameState);
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
          await cacheGame(gameId, gameState);
          Game.findByIdAndUpdate(gameId, { 
            whitePlayer: gameState.whitePlayer, 
            blackPlayer: gameState.blackPlayer 
          }).exec();
        }
        const role = socket.id === gameState.whitePlayer ? 'w' : 
                                  socket.id === gameState.blackPlayer ? 'b' : 'spectator';

        socket.emit('game_state', {
          ...gameState,
          role
        });

      } catch (err) {
        console.error("Join Error:", err);
        socket.emit('error', 'Failed to join game');
      }
    });

    socket.on('make_move', async ({ gameId, from, to, promotion }) => {
      try {
        const roomName = `game:${gameId}`;

        const cachedGame = await redisClient.get(roomName);
        if (!cachedGame) return socket.emit('error', 'Game session expired');

        const gameState = JSON.parse(cachedGame);

        if (gameState.isGameOver) return;

        const chess = new Chess(gameState.fen);

        const move = chess.move({ from, to, promotion: promotion || 'q' });

        if (!move) {
          return socket.emit('move_error', 'Invalid move');
        }
        gameState.fen = chess.fen();
        gameState.pgn = chess.pgn();
        gameState.turn = chess.turn();
        gameState.lastMove = { from, to, san: move.san };
        
        if (chess.isGameOver()) {
          gameState.isGameOver = true;
          if (chess.isCheckmate()) gameState.winner = chess.turn() === 'w' ? 'b' : 'w';
          else if (chess.isDraw()) gameState.winner = 'draw';
        }

        await cacheGame(gameId, gameState);

        io.to(roomName).emit('board_update', {
          fen: gameState.fen,
          lastMove: gameState.lastMove,
          turn: gameState.turn,
          check: chess.inCheck(),
          isGameOver: gameState.isGameOver,
          winner: gameState.winner
        });
        Game.findByIdAndUpdate(gameId, {
          fen: gameState.fen,
          pgn: gameState.pgn,
          turn: gameState.turn,
          lastMove: gameState.lastMove,
          isGameOver: gameState.isGameOver,
          winner: gameState.winner
        }).exec();

      } catch (err) {
        console.error("Move Error:", err);
      }
    });

    socket.on('send_chat', async ({ gameId, text }) => {
      try {
        const roomName = `game:${gameId}`;
        const cachedGame = await redisClient.get(roomName);
        let role = 'spectator';

        if (cachedGame) {
          const gameState = JSON.parse(cachedGame);
          if (socket.id === gameState.whitePlayer) role = 'w';
          else if (socket.id === gameState.blackPlayer) role = 'b';
        }
        io.to(roomName).emit('chat_message', {
          text,
          role,
          timestamp: Date.now()
        });
      } catch (err) {
        console.error("Chat Error:", err);
      }
    });
  });
};

module.exports = socketHandler;