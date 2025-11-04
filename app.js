const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const gameRouter = require('./controllers/game')

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')));

logger.info('connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch((error) => logger.error('error connection to MongoDB:', error.message))


app.use(middleware.requestLogger)
app.use(express.json())

app.use('/api/game', gameRouter)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
