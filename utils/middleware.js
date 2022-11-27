const logger = require('./logger')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('./config')
const User = require('../models/user')

const logging = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const tokenExtractor = (req, res, next) => {
  req.token = getTokenFrom(req)
  next()
}

const userExtractor = async (req, res, next) => {
  if (req.token) {
    const decodedToken = jwt.verify(req.token, JWT_SECRET)
    req.user = decodedToken.id ? await User.findById(decodedToken.id) : null
  }
  next()
}

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

const unknownEndpoint = (req, res) =>
  res.status(404).json({ error: 'resource not found.' })

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  switch (error.name) {
    case 'JsonWebTokenError':
      return res.status(401).json({ error: 'invalid token' })
    case 'InvalidUsernameOrPasswordError':
      return res.status(401).json({ error: error.message })
    case 'MissingPasswordError':
    case 'UserAlreadyExistsError':
    case 'InvalidPasswordError':
    case 'ValidationError':
      return res.status(400).json({ error: error.message })

    default:
      return res.status(500).end()
  }
}

module.exports = { tokenExtractor, userExtractor, unknownEndpoint, errorHandler, logging }
