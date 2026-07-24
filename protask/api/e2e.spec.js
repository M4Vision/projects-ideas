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
