const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const gameRouter = require('./controllers/game')

const app = express()

app.use(express.json())

app.use((req, res, next) => {
  logger.info('--- incoming request ---')
  logger.info('Method:', req.method, 'Path:', req.path)
  logger.info('Headers:', JSON.stringify(req.headers))
  logger.info('Parsed body:', req.body)
  next()
})

app.use(middleware.requestLogger)

app.use('/api/game', gameRouter)

app.use(express.static(path.join(__dirname, 'dist')))

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

logger.info('connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch((error) => logger.error('error connection to MongoDB:', error.message))

module.exports = app
