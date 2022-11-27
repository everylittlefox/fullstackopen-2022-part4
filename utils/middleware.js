const logger = require('./logger')

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

const getTokenFrom = request => {
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

module.exports = { tokenExtractor, unknownEndpoint, errorHandler, logging }
