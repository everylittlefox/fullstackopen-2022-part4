const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { InvalidUsernameOrPasswordError } = require('../utils/error')
const { JWT_SECRET } = require('../utils/config')

const loginRouter = require('express').Router()

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })

  if (!user) throw new InvalidUsernameOrPasswordError()

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) throw new InvalidUsernameOrPasswordError()

  const token = jwt.sign({ username, id: user.id }, JWT_SECRET)
  return response.json({ username, name: user.name, token })
})

module.exports = loginRouter
