const API_URL = globalThis.API_URL || 'http://localhost:3001/api'
let _token = null

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
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Erreur ' + res.status)
  return data
}

const demoApi = {
  async register(data) {
    const result = await request('POST', '/auth/register', data)
    _token = result.token
    return result
  },

  async login(data) {
    const result = await request('POST', '/auth/login', data)
    _token = result.token
    return result
  },

  async logout() {
    const result = await request('POST', '/auth/logout')
    _token = null
    return result
  },

  async getBoards() {
    return request('GET', '/boards')
  },

  async getBoard(id) {
    return request('GET', '/boards/' + id)
  },

  async createBoard(data) {
    return request('POST', '/boards', data)
  },

  async updateBoard(id, data) {
    return request('PUT', '/boards/' + id, data)
  },

  async deleteBoard(id) {
    return request('DELETE', '/boards/' + id)
  },

  async getColumns(boardId) {
    return request('GET', '/boards/' + boardId + '/columns')
  },

  async createColumn(boardId, data) {
    return request('POST', '/boards/' + boardId + '/columns', data)
  },

  async updateColumn(id, data) {
    return request('PUT', '/columns/' + id, data)
  },

  async deleteColumn(id) {
    return request('DELETE', '/columns/' + id)
  },

  async reorderColumns(items) {
    return request('PUT', '/columns/reorder', items)
  },
}

export default demoApi
