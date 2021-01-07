const express = require('express')
const cors = require('cors')

const { v4: uuid, validate: isUuid } = require('uuid')

const app = express()

app.use(express.json())
app.use(cors())

const repositories = []

const validateRepositoryId = (req, res, next) => {
  const { id } = req.params
  const repository = repositories.findIndex(repository => repository.id === id)

  if (repository === -1) {
    return res.status(400).json({})
  }

  req.params.index = repository
  next()
}

function existsKeys(obj) {
  const keys = Object.keys(obj)
  return keys.includes('title', 'url', 'techs')
}

function isUndefined(obj) {
  const undefined = Object.values(obj)
                          .filter(value => value === null || value === '')
  return undefined.length > 0
}

const validateData = (req, res, next) => {
  if (!existsKeys(req.body) || isUndefined(req.body)) {
    return res.status(404).json({ message: 'Inputs emptys' })
  }

  if (!Array.isArray(req.body.techs)) {
    return res.status(400).json({ message: 'Input techs is not array' })
  }

  return next()
}

app.get('/repositories', (req, res) => {
  return res.status(200).json(repositories)
})

app.post('/repositories', /*validateData*/ (req, res) => {
  const { title, url, techs } = req.body
  repositories.push({id: uuid(), title, url, techs, likes: 0})

  const lastIndex = repositories.length - 1

  return res.status(201).json(repositories[lastIndex])
})

app.put('/repositories/:id', validateRepositoryId, /*validateData*/ (req, res) => {
  const { index } = req.params
  const { title, url, techs } = req.body
  //poderia fazer {...repositories[index]}, mas manter o padrão do obj
  repositories[index] = { 
    id: repositories[index].id , 
    title, 
    url, 
    techs, 
    likes: repositories[index].likes
  }

  return res.status(200).json(repositories[index])
})

app.delete('/repositories/:id', validateRepositoryId, (req, res) => {
  const { index } = req.params
  repositories.splice(index, 1)
  return res.status(204).json(repositories)
})

app.post('/repositories/:id/like', validateRepositoryId, (req, res) => {
  const { index } = req.params
  repositories[index].likes += 1

  return res.status(201).json({ likes: repositories[index].likes })
})

module.exports = app
