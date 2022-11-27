class InvalidPasswordError extends Error {
  constructor() {
    super('invalid password')
    this.name = 'InvalidPasswordError'
  }
}

class InvalidUsernameOrPasswordError extends Error {
  constructor() {
    super('invalid username or password')
    this.name = 'InvalidUsernameOrPasswordError'
  }
}

class MissingPasswordError extends Error {
  constructor() {
    super('password field is required')
    this.name = 'MissingPasswordError'
  }
}

class UserAlreadyExistsError extends Error {
  constructor(username) {
    super(`a user with username ${username} already exists`)
    this.name = 'UserAlreadyExistsError'
  }
}

module.exports = {
  InvalidPasswordError,
  MissingPasswordError,
  UserAlreadyExistsError,
  InvalidUsernameOrPasswordError
}
