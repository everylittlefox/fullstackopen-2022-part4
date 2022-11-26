const sum = (arr, field) => {
  return arr.reduce((acc, el) => acc + (field ? el[field] : el), 0)
}

const dummy = (blogs) => 1

const totalLikes = (blogs) => sum(blogs, 'likes')

const favoriteBlog = (blogs) => {
  if (!blogs.length) return null

  const { title, author, likes } = blogs.reduce((fav, b) =>
    b.likes > fav.likes ? b : fav
  )
  return { title, author, likes }
}

const mostBlogs = (blogs) => {
  if (!blogs.length) return null

  if (blogs.length === 1) return { author: blogs[0].author, blogs: 1 }

  const authorsToNumBlogs = blogs.reduce((dict, b) => {
    dict.set(b.author, (dict.get(b.author) || 0) + 1)
    return dict
  }, new Map())

  const [author, numAuthorBlogs] = [...authorsToNumBlogs].reduce(
    ([maxA, maxB], [a, b]) => (b > maxB ? [a, b] : [maxA, maxB]),
    [null, -1]
  )

  return { author, blogs: numAuthorBlogs }
}

const mostLikes = (blogs) => {
  if (!blogs.length) return null

  if (blogs.length === 1) return { author: blogs[0].author, likes: blogs[0].likes }

  const authorsToLikesArray = blogs.reduce((dict, b) => {
    dict.set(b.author, (dict.get(b.author) || []).concat(b.likes))
    return dict
  }, new Map())

  const authorsToNumLikes = [...authorsToLikesArray].map(([author, arr]) => [author, sum(arr)])

  const [author, numAuthorLikes] = authorsToNumLikes.reduce(
    ([maxA, maxB], [a, b]) => (b > maxB ? [a, b] : [maxA, maxB]),
    [null, -1]
  )

  return { author, likes: numAuthorLikes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
