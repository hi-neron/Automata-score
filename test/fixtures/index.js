'use strict'
const uuid = require('uuid-base62')

module.exports = {
  getUser () {
    return {
      name: 'whatever user',
      username: `A_random_username`,
      password: uuid.uuid(),
      email: `${uuid.uuid()}@automata.co`,
      bio: 'it is a bio with 200 ascii length',
      createdAt: new Date(),
      avatar: '/standard.png',
      masteries: [],
      skills: ['clock'],
      points: 160,
      images: 2,
      level: 0
    }
  }
}
