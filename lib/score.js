'use strict'

const Db = require('automata-db')
const Dbstub = require('../test/stubs')
const co = require('co')
const Promise = require('bluebird')
const Skills = require('automata-skills') // static getSkillList
const _ = require('lodash')

const env = process.env.NODE_ENV || 'production'

// la clase ScoreSystem crea un objeto que evalua las acciones del usuario
// y las puntifica.
class ScoreSystem {
  constructor (config) {
    let data = config || {db: 'automata'}

    this.skillList = []

    if (env === 'test') {
      this.db = new Dbstub()
    } else {
      this.db = new Db(data)
    }
  }

  // Funcion PRINCIPAL
  // ---- evaluadora -----
  rateAction (username, action, data, cb) {
    // Acciones posibles:
    //  {
    //    PushImage
    //    DeleteImage
    //    ActivateSkill
    //  }

    // Confirma que la accion sea valida

    // Si es una accion del tipo pushImage
    // Si es una accion del tipo deleteImage
    // Si es una accion del tipo activateSkill

    // devuelve los nuevos puntos del usuario
    // Tambien devuelve una skill nueva, si se consigue

    const db = this.db
    let onPushImage = this.onPushImage.bind(this)
    let onDeleteImage = this.onDeleteImage.bind(this)
    let onSkillActivate = this.onSkillActivate.bind(this)
    let addSkillList = this.addSkillList.bind(this)

    let tasks = co.wrap(function * () {
      console.log(db, '<< db en score')
      // Busca el usuario en la base de datos
      yield db.connect()

      // Obtiene una lista de skills
      console.log('before skills')
      let skillList = yield Skills.getSkillList()
      // Los guarda en la clase
      console.log(skillList)

      addSkillList(skillList)

      console.log(username, action)
      let user

      try {
        user = yield db.getUser(username)
      } catch (e) {
        return Promise.reject(e)
      }

      console.log('user passed')

      let toEvaluate = {
        points: user.points,
        skills: user.skills,
        images: user.images,
        level: user.level
      }

      let bonus

      switch (action) {
        case 'pushImage':
          let images

          try {
            // se aumenta el contador de imagenes
            images = yield db.addImage(username)
            // se añade a la data a evaluar
            toEvaluate.images = images
            // se evalua la data
            bonus = yield onPushImage(toEvaluate, data)

          } catch (e) {
            return Promise.reject(e)
          }
          break

        case 'deleteImage':
          let imageDeleted

          try {
            // se reduce el contador de imagenes
            imageDeleted = yield db.reduceUserImages(username)
            // se añade a la data a evaluar
            toEvaluate.images = imageDeleted
            // se evalua la data
            bonus = yield onDeleteImage(toEvaluate, data)
          } catch (e) {
            return Promise.reject(e)
          }
          break

        case 'skillActivate':
          // data obtenida
          // (username, action, data, cb)
          bonus = yield onSkillActivate(toEvaluate, data)
          break

        default:
          return Promise.reject(new Error('invalid action'))
      }

      console.log('switch passed', bonus)

      let pointsAdded = bonus.points
      let skillsAdded = []
      let badgesAdded = []
      // let nextAchive = bonus.nextAchive

      if (bonus.points !== toEvaluate.points) {
        let pushPoints = bonus.points - toEvaluate.points
        pointsAdded = yield db.addPoints(username, pushPoints)
      }

      if (bonus.newSkill) {
        try {
          skillsAdded = yield db.addSkill(username, bonus.newSkill)
        } catch (e) {
          return Promise.reject(e)
        }
      }
      console.log('newSkill passed', skillsAdded)

      if (bonus.badge) {
        badgesAdded = yield db.addBadge(username, bonus.newBadge)
      }

      yield db.disconnect()

      let response = {
        username: username,
        points: bonus.points,
        bonus: {
          points: '+ ' + (pointsAdded),
          skill: skillsAdded,
          badges: badgesAdded
        },
        nextAchive: bonus.nextAchive
      }

      return Promise.resolve(response)
    })
    return Promise.resolve(tasks()).asCallback(cb)
  }

  onPushImage (achievements, data) {
    // se asigna el numero de puntos que se va a sumar
    // para esta accion es: 10
    let points = achievements.points

    let pointsToAdd = 10

    // Se ajustan los limites, puntajes y niveles:
    let skillGeneratorResponse = this.skillGenerator(achievements, pointsToAdd)
    // Se contorlan los desafíos
    let badgeToAdd = this.badgeGenerator(points, data)

    // Agrega los datos a una respuesta
    let newData = {
      points: skillGeneratorResponse.points,
      badges: badgeToAdd,
      newSkill: skillGeneratorResponse.newSkill,
      nextAchive: skillGeneratorResponse.nextAchive,
      message: skillGeneratorResponse.message
    }
    return Promise.resolve(newData)
  }

  onDeleteImage (achievements, data) {
    // se asigna el numero de puntos que se va a sumar
    // para esta accion es: -10
    let pointsToAdd = -10

    // Se ajustan los limites, puntajes y niveles:
    let skillGeneratorResponse = this.skillGenerator(achievements, pointsToAdd)

    // Agrega los datos a una respuesta
    let newData = {
      points: skillGeneratorResponse.points,
      badges: null,
      newSkill: skillGeneratorResponse.newSkill,
      nextAchive: skillGeneratorResponse.nextAchive,
      message: skillGeneratorResponse.message
    }

    return Promise.resolve(newData)
  }

  onSkillActivate (achievements, data) {
    // se asigna el numero de puntos que se va a sumar
    // para esta accion es: 1
    let pointsToAdd = 2

    // Se ajustan los limites, puntajes, nivelesy mensajes:
    let skillGeneratorResponse = this.skillGenerator(achievements, pointsToAdd)

    let newData = {
      points: skillGeneratorResponse.points,
      badges: null,
      newSkill: skillGeneratorResponse.newSkill,
      nextAchive: skillGeneratorResponse.nextAchive,
      message: skillGeneratorResponse.message
    }

    return Promise.resolve(newData)
  }

  getOneSkill (userSkills) {
    // crear un array con las skills que no tenga el jugador
    let alternatives = _.difference(this.skillList, userSkills)
    // la skill asignada debe ser aleatoria entre las skills que no posea
    let random = Math.floor(Math.random() * alternatives.length)
    let newSkill = alternatives[random]
    return newSkill
  }

  skillGenerator (achievements, pointsToAdd) {
    let points = achievements.points
    let skills = achievements.skills
    let images = achievements.images
    // let level = achievements.level

    // define un mensaje que se utilizara segun sea el caso
    let message = ''
    // 100 es el punto de partida
    let firstLvl = 100
    let lvl = 0
    let module

    // Se buscan los niveles segun el puntaje
    for (let i = 0; i < points + pointsToAdd; i++) {
      if (i % (firstLvl) === 0) {
        for (let y = 0; y <= lvl; y++) {
          module = 60 + (y * 20)
        }

        firstLvl += module
        lvl++
      }
    }

    let module2
    let limit = 100

    // se busca el siguiente nivel, y se lo deja de limite
    for (let y = 0; y < lvl; y++) {
      module2 = 60 + (y * 20)
      limit += module2
    }

    // Se crea un requerimiento de imagenes
    let imageAmount = 0

    for (let i = 0; i <= lvl; i++) {
      if (i % 4 === 0) {
        imageAmount++
      }
    }

    // Se crea una cartera de skills
    let skillsAmount = 1
    for (let i = 0; i <= lvl; i++) {
      if (i % 3 === 0) {
        skillsAmount++
      }
    }

    // se asigna un contador regresivo para enviar al usuario
    // informacion de cuantas imagenes faltan para el obtener el siguiente skill
    let imagesRequired = imageAmount - images <= 0 ? 0 : imageAmount - images
    let skillsAvailable = skillsAmount - skills.length <= 0 ? 0 : skillsAmount - skills.length

    // se suman los puntajes
    points += pointsToAdd

    // se asigna un contador regresivo para enviar al usuario
    // informacion de cuantos puntos faltan para el obtener el siguiente skill
    let pointsRequired = limit - points

    // se crea un template de la respuesta
    let data = {
      nextAchive: {
        pointsRequired: pointsRequired,
        imagesRequired: imagesRequired,
        skillsAvailable: skillsAvailable
      },
      points: points,
      newSkill: null,
      message: message
    }

    // si es la primer skill, retorna una aleatoria
    if (skills.length === 0) {
      data.newSkill = this.getOneSkill(skills)
      data.message = 'You uploaded the first image, we given you a boost'
      return data
    }

    // si ya se alcanzo el numero completo de skills, termina la Funcion
    if (skills.length === this.skillList.length) {
      data.message = 'You already have all skills in the list'
      return data
    }

    if (imagesRequired === 0 && skillsAvailable > 0) {
      // se devuelve la nueva skill calientita
      data.message = "you've won a new skill"
      data.newSkill = this.getOneSkill(skills)
    }

    return data
  }

  badgeGenerator (points, data) {
    let newBadge = null
    return newBadge
  }

  addSkillList (skillList) {
    this.skillList = skillList
  }

  getUserSkills (username, cb) {
    const db = this.db
    let tasks = co.wrap(function * () {
      yield db.connect()
      let user

      try {
        user = yield db.getUser(username)
      } catch (e) {
        return Promise.reject(e)
      }

      let skills = user.skills
      yield db.disconnect()

      return Promise.resolve(skills)
    })
    return Promise.resolve(tasks()).asCallback(cb)
  }
}

module.exports = ScoreSystem
