const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const gameRouter = require('./controllers/game')

const app = express()

logger.info('connecting to', config.MONGODB_URI)
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('connected to MongoDB'))
  .catch((error) => logger.error('error connection to MongoDB:', error.message))


app.use(middleware.requestLogger)
app.use(express.json())

const distPath = path.join(__dirname, 'dist')
app.use('/', express.static(distPath, { index: 'index.html' }))

app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      req.app.locals.logger && req.app.locals.logger.error('sendFile error', err)
      res.status(500).send('Internal Server Error')
    }
  })
})

app.use('/api/game', gameRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
