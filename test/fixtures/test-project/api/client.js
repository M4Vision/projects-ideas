const API_URL = (globalThis.API_URL || 'http://localhost:3001') + '/api'
let _token = null
let _currentUser = null

function headers() {
  const h = { 'Content-Type': 'application/json' }
  if (_token) h['Authorization'] = 'Bearer ' + _token
  return h
}

async function request(method, path, body) {
  const res = await fetch(API_URL + path, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.status === 204 ? null : await res.json()
  if (!res.ok) throw new Error((data && data.error) || 'Erreur ' + res.status)
  return data
}

const demoApi = {
  async login(data) {
    const result = await request('POST', '/auth/login', data)
    _token = result.token
    _currentUser = result.user
    return result
  },

  async logout() {
    _token = null
    _currentUser = null
  },

  async getMe() {
    const user = await request('GET', '/auth/me')
    _currentUser = user
    return user
  },

  async getTodos() {
    return request('GET', '/todos')
  },

  async createTodo(data) {
    return request('POST', '/todos', data)
  },

  async updateTodo(id, data) {
    return request('PUT', '/todos/' + id, data)
  },

  async deleteTodo(id) {
    return request('DELETE', '/todos/' + id)
  },
}

export { demoApi }
