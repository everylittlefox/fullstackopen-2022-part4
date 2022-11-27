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
app.use(middleware.logging)

app.use('/api/login', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/blogs', blogRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
