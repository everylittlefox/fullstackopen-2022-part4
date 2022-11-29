const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const blogRouter = require('./controllers/blog')
const middleware = require('./utils/middleware')
const { MONGODB_URI } = require('./utils/config')
const logger = require('./utils/logger')
const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')

mongoose
  .connect(MONGODB_URI)
  .then(() => logger.info('connected to mongodb'))
  .catch((e) => logger.error(e))

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(middleware.logging)

app.use('/api/login', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/blogs', blogRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
