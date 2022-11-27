const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

jest.setTimeout(30000)

beforeEach(async () => {
  await User.deleteMany({})
  await new User({
    name: 'root',
    username: 'root',
    passwordHash: await bcrypt.hash('seqret', 10)
  }).save()
})

test('get list of users', async () => {
  const response = await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body).toHaveLength(1)

  const usernames = response.body.map((u) => u.username)
  expect(usernames).toContain('root')

  expect(response.body[0].passwordHash).not.toBeDefined()
})

describe('add new user', () => {
  test('fails with statuscode 400 if "username" or "password" is missing', async () => {
    let response = await api
      .post('/api/users')
      .send({ username: 'username' })
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(response.body.error).toBeDefined()

    response = await api
      .post('/api/users')
      .send({ password: 'password' })
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(response.body.error).toBeDefined()

    await api
      .post('/api/users')
      .send({})
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const users = await User.find({})
    expect(users).toHaveLength(1)
  })

  test('fails with statuscode 400 if either "username" or "password" is less than 3 characters', async () => {
    let response = await api
      .post('/api/users')
      .send({ username: 'username', password: 'pa' })
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(response.body.error).toBeDefined()

    response = await api
      .post('/api/users')
      .send({ username: 'us', password: 'password' })
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(response.body.error).toBeDefined()

    await api
      .post('/api/users')
      .send({ username: 'us', password: 'pa' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const users = await User.find({})
    expect(users).toHaveLength(1)
  })

  test('fails with statuscode 400 if "username" is not unique', async () => {
    const response = await api
      .post('/api/users')
      .send({ username: 'root', password: 'password' })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toBeDefined()

    const users = await User.find({})
    expect(users).toHaveLength(1)
  })
})

afterAll(() => mongoose.connection.close())
