'use strict'

const test = require('ava')
const ScoringSystem = require('../')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const fixtures = require('./fixtures')

let env = process.env.NODE_ENV || 'production'

test.beforeEach('setup grid class', t => {
  const dbName = `automata_${uuid.v4()}`
  // const db = new Db({})
  const score = new ScoringSystem({db: dbName, setup: true})

  t.context.score = score
  t.context.dbName = dbName
})

test.afterEach.always('Clean up', async t => {
  let dbName = t.context.dbName
  if (env !== 'test') {
    let conn = await r.connect({})
    await r.dbDrop(dbName).run(conn)
  }
})

test('Get points from push an image', async t => {
  let score = t.context.score
  //  rateAction (<username>, <action>, <data>)
  let user = fixtures.getUser()

  let username = user.username
  t.is(typeof score.rateAction, 'function')
  t.is(typeof score.onPushImage, 'function')

  let response = await score.rateAction(username, 'pushImage', null)
  // debe devolver el nombre del usuario
  t.is(response.username, username)
  // La actualizacion de los puntajes
  t.is(response.points, 170)
  // Una propiedad que muestra los extras <nuevas skills si se consiguen>
  t.is(typeof response.bonus, 'object')
  t.truthy(response.bonus.skill)
})

test('Get points from Delete an image', async t => {
  let score = t.context.score
  //  rateAction (<username>, <action>, <data>)
  let user = fixtures.getUser()

  let username = user.username
  t.is(typeof score.rateAction, 'function')
  t.is(typeof score.onDeleteImage, 'function')

  let response = await score.rateAction(username, 'deleteImage', null)
  // debe devolver el nombre del usuario
  t.is(response.username, username)
  // La actualizacion de los puntajes
  t.is(response.points, 150)
  // Una propiedad que muestra los extras <nuevas skills si se consiguen>
  t.is(typeof response.bonus, 'object')
  t.truthy(response.bonus.skill)
})

test('Get points from skill activate', async t => {
  let score = t.context.score
  //  rateAction (<username>, <action>, <data>)
  let user = fixtures.getUser()

  let username = user.username
  t.is(typeof score.rateAction, 'function')
  t.is(typeof score.onSkillActivate, 'function')

  let response = await score.rateAction(username, 'skillActivate', null)
  // debe devolver el nombre del usuario
  t.is(response.username, username)
  // La actualizacion de los puntajes
  t.is(response.points, 161)
  // Una propiedad que muestra los extras <nuevas skills si se consiguen>
  t.is(typeof response.bonus, 'object')
  t.truthy(response.bonus.skill)
})
