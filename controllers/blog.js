const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)
})

blogRouter.post('/', userExtractor, async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = new Blog({
    ...request.body,
    likes: request.body.likes || 0,
    user: user._id
  })
  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  return response.status(201).json(savedBlog)
})

blogRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      runValidators: true,
      context: 'query',
      new: true
    }
  )
  response.status(200).json(updatedBlog)
})

blogRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blogInUser = user.blogs.find((b) => b.toString() === request.params.id)

  if (!blogInUser) {
    return response
      .status(401)
      .json({ error: 'you are not authorized to perform this action' })
  }

  user.blogs = user.blogs.filter((b) => b.toString() !== request.params.id)
  await user.save()

  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogRouter
