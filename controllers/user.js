const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const {
  MissingPasswordError,
  InvalidPasswordError,
  UserAlreadyExistsError
} = require('../utils/error')

userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1
  })
  return response.json(users)
})

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!password) throw new MissingPasswordError()
  if (password.length < 3) throw new InvalidPasswordError()

  const existingUser = await User.findOne({ username })
  if (existingUser) throw new UserAlreadyExistsError(username)

  const rounds = 10
  const passwordHash = await bcrypt.hash(password, rounds)

  const user = new User({ username, name, passwordHash })
  const userJson = await user.save()
  return response.status(201).json(userJson)
})

module.exports = userRouter
