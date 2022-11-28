const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const { JWT_SECRET } = require('../utils/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const api = supertest(app)

const blogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }
]

jest.setTimeout(30000)

describe('when there is initially some blogs in db', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    const saveBlogsPromises = blogs.map((b) => new Blog(b).save())
    await Promise.all(saveBlogsPromises)
  })

  test('all blogs are returned', async () => {
    const res = await api.get('/api/blogs')

    expect(res.body).toHaveLength(blogs.length)
  })

  test('unique identifier property of the blog posts is named id', async () => {
    const res = await api.get('/api/blogs')
    const blogs = res.body

    expect(blogs[0].id).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  let token = null

  beforeEach(async () => {
    await Blog.deleteMany({})
    token = (await generateNewUserToken())[0]
  })

  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'new title',
      author: 'new author',
      url: 'new url',
      likes: 0
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const newBlogsList = await Blog.find({})
    expect(newBlogsList).toHaveLength(1)

    const titles = newBlogsList.map((b) => b.title)
    expect(titles).toContain('new title')
  })

  test('missing "likes" property defaults to zero', async () => {
    const newBlog = {
      title: 'new title',
      author: 'new author',
      url: 'new url'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)

    const createdBlog = response.body

    expect(createdBlog.likes).toBe(0)
  })

  test('fails with statuscode 400 if "title" or "url" is missing', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send({ title: 'new title' })
      .expect(400)
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send({ url: 'new url' })
      .expect(400)
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send({})
      .expect(400)
  })

  test('user field of blog is populated', async () => {
    const newBlog = {
      title: 'new title',
      author: 'new author',
      url: 'new url'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)

    const createdBlog = response.body

    expect(createdBlog.user).toBeDefined()
  })
})

describe('update a blog', () => {
  let token = null
  let blog = null

  beforeEach(async () => {
    await Blog.deleteMany({})
    const [t, user] = await generateNewUserToken()
    const { id } = jwt.verify(t, JWT_SECRET)

    const blogToUpdate = new Blog({
      title: 'new title',
      author: 'new author',
      url: 'new url',
      user: id
    })

    user.blogs = user.blogs.concat(blogToUpdate._id)
    await user.save()

    await blogToUpdate.save()

    blog = blogToUpdate.toJSON()
    token = t
  })

  test('update when user token provided', async () => {
    await api
      .put(`/api/blogs/${blog.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({ ...blog, author: 'updated author' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const updatedBlogsList = await Blog.find({})
    const authors = updatedBlogsList.map((ub) => ub.author)

    expect(authors).toContain('updated author')
  })

  test('fails with 401 when user token not provided', async () => {
    await api
      .put(`/api/blogs/${blog.id}`)
      .send({ ...blog, author: 'updated author' })
      .expect(401)

    const updatedBlogsList = await Blog.find({})
    const authors = updatedBlogsList.map((ub) => ub.author)

    expect(authors).not.toContain('updated author')
  })
})

describe('delete a blog', () => {
  let token = null
  let blog = null

  beforeEach(async () => {
    await Blog.deleteMany({})
    const [t, user] = await generateNewUserToken()
    const { id } = jwt.verify(t, JWT_SECRET)

    const blogToDelete = new Blog({
      title: 'new title',
      author: 'new author',
      url: 'new url',
      user: id
    })

    user.blogs = user.blogs.concat(blogToDelete._id)
    await user.save()

    await blogToDelete.save()

    blog = { id: blogToDelete._id.toString(), title: blogToDelete.title }
    token = t
  })

  test('delete when user token provided', async () => {
    await api
      .delete(`/api/blogs/${blog.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const newBlogsList = await Blog.find({})
    expect(newBlogsList).toHaveLength(0)

    const titles = newBlogsList.map((nb) => nb.title)
    expect(titles).not.toContain(blog.title)
  })

  test('fails with 401 when user token not provided', async () => {
    const blog = (await Blog.findOne({})).toJSON()

    await api.delete(`/api/blogs/${blog.id}`).expect(401)

    const newBlogsList = await Blog.find({})
    expect(newBlogsList).toHaveLength(1)

    const titles = newBlogsList.map((nb) => nb.title)
    expect(titles).toContain(blog.title)
  })
})

afterAll(() => {
  mongoose.connection.close()
})

const generateNewUserToken = async () => {
  await User.deleteMany({})
  const user = new User({
    username: 'root',
    passwordHash: await bcrypt.hash('root', 10)
  })
  await user.save()
  return [
    jwt.sign({ username: user.username, id: user._id.toString() }, JWT_SECRET),
    user
  ]
}
