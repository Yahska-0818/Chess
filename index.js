const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./utils/config');
const logger = require('./utils/logger');

const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 30000,
});

const rooms = new Map();
app.set('io', io);
app.set('rooms', rooms);

io.on('connection', (socket) => {
  logger.info("Socket connected:", socket.id);

  socket.on("join-room", (roomCode) => {
    if (typeof roomCode !== 'string' || roomCode.length !== 6) {
      socket.emit('room:error', 'Invalid room code');
      return;
    }

    socket.join(roomCode);

    let meta = rooms.get(roomCode);
    if (!meta) meta = { white: null, black: null };

    let assigned;
    if (!meta.white && !meta.black) {
      assigned = Math.random() < 0.5 ? 'white' : 'black';
      meta[assigned] = socket.id;
    } else if (meta.white && !meta.black) {
      meta.black = socket.id;
      assigned = 'black';
    } else if (!meta.white && meta.black) {
      meta.white = socket.id;
      assigned = 'white';
    } else {
      socket.emit('room:error', 'Room is full');
      return;
    }

    rooms.set(roomCode, meta);

    socket.emit('room:color', assigned);

    io.to(roomCode).emit('room:roster', {
      white: !!meta.white,
      black: !!meta.black
    });
  });

  socket.on("chat:message", ({ roomCode, message }) => {
    io.to(roomCode).emit("chat:message", message);
  });

  socket.on("disconnect", () => {
    for (const [rc, meta] of rooms.entries()) {
      if (meta.white === socket.id) meta.white = null;
      if (meta.black === socket.id) meta.black = null;
      rooms.set(rc, meta);
      io.to(rc).emit('room:roster', {
        white: !!meta.white,
        black: !!meta.black
      });
    }
    logger.info("Socket disconnected:", socket.id);
  });
});

server.listen(config.PORT || 3000, () => {
  logger.info(`Server running on port ${config.PORT || 3000}`);
});
