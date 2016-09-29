'use strict'

const fixtures = require('../fixtures')

class Database {
  connect () {
    return Promise.resolve(true)
  }

  disconnect () {
    return Promise.resolve(true)
  }

  getUser (username, size) {
    let user = fixtures.getUser()
    user.username = username
    return Promise.resolve(user)
  }

  addPoints (username, points) {
    return Promise.resolve(points)
  }

  addSkill (username, skill) {
    return Promise.resolve(skill)
  }

  addImage (username) {
    return Promise.resolve(1)
  }

  reduceUserImages (username) {
    return Promise.resolve(1)
  }
}

module.exports = Database
