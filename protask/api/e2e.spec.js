import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import { serve } from '@hono/node-server'
import app from './server.js'

const PORT = parseInt(process.env.API_PORT || '3001')
const BASE = `http://localhost:${PORT}/api`

let server

beforeAll(async () => {
  return new Promise((resolve) => {
    server = serve({ fetch: app.fetch, port: PORT }, resolve)
  })
})

afterAll(() => {
  server?.close()
})

beforeEach(async () => {
  await fetch(`${BASE}/_reset`, { method: 'POST' })
})

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { method: 'POST', headers, body: JSON.stringify(body) })
  const data = await res.json()
  return { status: res.status, data }
}

async function get(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { headers })
  const data = await res.json()
  return { status: res.status, data }
}

async function put(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { method: 'PUT', headers, body: JSON.stringify(body) })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function del(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(BASE + path, { method: 'DELETE', headers })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

describe('Authentification', () => {

  it('inscrit un nouvel utilisateur', async () => {
    const { status, data } = await post('/auth/register', { name: 'Test', email: 'test@test.com', password: 'test1234' })
    expect(status).toBe(201)
    expect(data.user).toBeDefined()
    expect(data.user.name).toBe('Test')
    expect(data.user.email).toBe('test@test.com')
    expect(data.user.password).toBeUndefined()
    expect(data.token).toBe('token-' + data.user.id)
  })

  it('rejette un doublon email', async () => {
    await post('/auth/register', { name: 'A', email: 'dup@test.com', password: 'pass1234' })
    const { status, data } = await post('/auth/register', { name: 'B', email: 'dup@test.com', password: 'pass5678' })
    expect(status).toBe(400)
    expect(data.error).toContain('déjà utilisé')
  })

  it('connecte un utilisateur existant', async () => {
    await post('/auth/register', { name: 'Test', email: 'login@test.com', password: 'pass1234' })
    const { status, data } = await post('/auth/login', { email: 'login@test.com', password: 'pass1234' })
    expect(status).toBe(200)
    expect(data.user.email).toBe('login@test.com')
    expect(data.token).toBeTruthy()
  })

  it('rejette un mauvais mot de passe', async () => {
    await post('/auth/register', { name: 'Test', email: 'badpw@test.com', password: 'pass1234' })
    const { status, data } = await post('/auth/login', { email: 'badpw@test.com', password: 'wrong' })
    expect(status).toBe(401)
    expect(data.error).toContain('incorrect')
  })

  it('rejette un email inconnu', async () => {
    const { status, data } = await post('/auth/login', { email: 'nobody@test.com', password: 'pass1234' })
    expect(status).toBe(401)
    expect(data.error).toContain('incorrect')
  })

  it('retourne success sur logout', async () => {
    const { status, data } = await post('/auth/logout')
    expect(status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('réinitialise les données via _reset', async () => {
    await post('/auth/register', { name: 'Temp', email: 'temp@test.com', password: 'pass1234' })
    await post('/_reset')
    const { data } = await post('/auth/login', { email: 'temp@test.com', password: 'pass1234' })
    expect(data.error).toBeDefined()
  })

  it('inscrit les utilisateurs de démo au démarrage', async () => {
    const { data } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
    expect(data.user.name).toBe('Alexandre')
  })

})

describe('Boards', () => {

  let token

  beforeEach(async () => {
    const { data } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
    token = data.token
  })

  it('liste les boards de l\'utilisateur connecté', async () => {
    const { status, data } = await get('/boards', token)
    expect(status).toBe(200)
    expect(data.length).toBeGreaterThanOrEqual(2)
    expect(data[0].cardCount).toBeDefined()
    expect(data[0].members).toBeDefined()
  })

  it('crée un board avec titre, couleur, catégories, description', async () => {
    const { status, data } = await post('/boards', { title: 'Test', color: '#FF5722', categories: ['Dev', 'Design'], description: 'Un board de test' }, token)
    expect(status).toBe(201)
    expect(data.title).toBe('Test')
    expect(data.color).toBe('#FF5722')
    expect(data.categories).toEqual(['Dev', 'Design'])
    expect(data.description).toBe('Un board de test')
  })

  it('récupère un board avec ses colonnes et membres', async () => {
    const { data: board } = await post('/boards', { title: 'Complet' }, token)
    const { status, data } = await get('/boards/' + board.id, token)
    expect(status).toBe(200)
    expect(data.columns.length).toBe(3)
    expect(data.members).toBeDefined()
  })

  it('met à jour un board', async () => {
    const { data: board } = await post('/boards', { title: 'Avant' }, token)
    const { status, data } = await put('/boards/' + board.id, { title: 'Après', description: 'Modifié', color: '#4CAF50', categories: ['Backend'] }, token)
    expect(status).toBe(200)
    expect(data.title).toBe('Après')
    expect(data.description).toBe('Modifié')
    expect(data.color).toBe('#4CAF50')
    expect(data.categories).toEqual(['Backend'])
  })

  it('retourne 404 sur board inconnu', async () => {
    const { status, data } = await get('/boards/999', token)
    expect(status).toBe(404)
    expect(data.error).toContain('introuvable')
  })

  it('retourne 401 sans token', async () => {
    const { status } = await get('/boards')
    expect(status).toBe(401)
  })

})

describe('Colonnes', () => {

  let token, boardId

  beforeEach(async () => {
    await fetch(BASE + '/_reset', { method: 'POST' })
    const { data: loginData } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
    token = loginData.token
    const { data } = await post('/boards', { title: 'Col Test' }, token)
    boardId = data.id
  })

  it('liste les colonnes d\'un board', async () => {
    const { status, data } = await get('/boards/' + boardId + '/columns', token)
    expect(status).toBe(200)
    expect(data.length).toBe(3)
    expect(data[0].order).toBeLessThan(data[1].order)
  })

  it('crée une colonne', async () => {
    const { status, data } = await post('/boards/' + boardId + '/columns', { title: 'Nouvelle', color: '#FF9800', description: 'Ma col' }, token)
    expect(status).toBe(201)
    expect(data.title).toBe('Nouvelle')
    expect(data.color).toBe('#FF9800')
    expect(data.description).toBe('Ma col')
    expect(data.boardId).toBe(boardId)
  })

  it('met à jour une colonne', async () => {
    const { data: cols } = await get('/boards/' + boardId + '/columns', token)
    const { status, data } = await put('/columns/' + cols[0].id, { title: 'Modifiée', color: '#E91E63', description: 'Desc' }, token)
    expect(status).toBe(200)
    expect(data.title).toBe('Modifiée')
    expect(data.color).toBe('#E91E63')
    expect(data.description).toBe('Desc')
  })

  it('supprime une colonne', async () => {
    const { data: cols } = await get('/boards/' + boardId + '/columns', token)
    const { status } = await del('/columns/' + cols[0].id, token)
    expect(status).toBe(204)
    const { data: remaining } = await get('/boards/' + boardId + '/columns', token)
    expect(remaining.length).toBe(2)
  })

  it('réordonne les colonnes', async () => {
    const { data: cols } = await get('/boards/' + boardId + '/columns', token)
    const { status, data } = await put('/columns/reorder', [{ id: cols[0].id, order: 2 }, { id: cols[2].id, order: 0 }], token)
    expect(status).toBe(200)
    expect(data.find(c => c.id === cols[0].id).order).toBe(2)
    expect(data.find(c => c.id === cols[2].id).order).toBe(0)
  })

  it('retourne 404 sur colonne inconnue', async () => {
    const { status } = await put('/columns/999', { title: 'Nope' }, token)
    expect(status).toBe(404)
  })

})
