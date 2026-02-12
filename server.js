require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const socketHandler = require('./socket/socketHandler');

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://chess-yzah.onrender.com"
    ],
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chesslab')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

app.post('/api/game/create', async (req, res) => {
  const Game = require('./models/Game');
  const gameId = req.body.gameId || Math.random().toString(36).substring(2, 8).toUpperCase();
  
  try {
    const newGame = await Game.create({ _id: gameId });
    res.json({ gameId: newGame._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create game' });
  }
});
const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
