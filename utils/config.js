require('dotenv').config()

const PORT = process.env.PORT || 3003
const ENV = process.env.NODE_ENV
const MONGODB_URI =
  ENV === 'test' ? process.env.TEST_DB_URI : process.env.MONGODB_URI
const JWT_SECRET = process.env.JWT_SECRET

module.exports = { PORT, MONGODB_URI, JWT_SECRET }
