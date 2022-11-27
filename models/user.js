const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, minLength: 3 },
  passwordHash: { type: String, required: true },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

userSchema.set('toJSON', {
  transform(_, returnedObj, __) {
    returnedObj.id = returnedObj._id
    delete returnedObj._id
    delete returnedObj.__v
    delete returnedObj.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
