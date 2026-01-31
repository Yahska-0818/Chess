require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const cors = require('cors');

const socketHandler = require('./socket/socketHandler');
require('./config/redis');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

app.post('/api/game/create', async (req, res) => {
  const Game = require('./models/Game');
  try {
    const newGame = await Game.create({});
    res.json({ gameId: newGame._id });
  } catch (e) {
    res.status(500).json({ error: 'Could not create game' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});