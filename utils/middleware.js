const logger = require('./logger')

const logging = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (req, res) =>
  res.status(404).json({ error: 'resource not found.' })

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  switch (error.name) {
    case 'MissingPasswordError':
    case 'UserAlreadyExistsError':
    case 'InvalidPasswordError':
    case 'ValidationError':
      return res.status(400).json({ error: error.message })

    default:
      return res.status(500).end()
  }
}

module.exports = { unknownEndpoint, errorHandler, logging }
