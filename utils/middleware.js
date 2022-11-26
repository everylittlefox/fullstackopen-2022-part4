const logger = require("./logger");

const logging = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (req, res) =>
  res.status(404).json({ error: "resource not found." });

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);
  next(error)
};

module.exports = { unknownEndpoint, errorHandler, logging }
