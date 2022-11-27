require('dotenv').config()

const PORT = process.env.PORT || 3001
const ENV = process.env.NODE_ENV
const MONGODB_URI =
  ENV === 'test' ? process.env.TEST_DB_URI : process.env.MONGODB_URI

module.exports = { PORT, MONGODB_URI }
