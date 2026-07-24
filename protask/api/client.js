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

  async getCards(columnId) {
    return request('GET', '/columns/' + columnId + '/cards')
  },

  async getCard(id) {
    return request('GET', '/cards/' + id)
  },

  async createCard(columnId, data) {
    return request('POST', '/columns/' + columnId + '/cards', data)
  },

  async updateCard(id, data) {
    return request('PATCH', '/cards/' + id, data)
  },

  async deleteCard(id) {
    const res = await fetch(API_URL + '/cards/' + id, { method: 'DELETE', headers: headers() })
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ' + res.status)
    return null
  },

  async moveCard(id, data) {
    return request('POST', '/cards/' + id + '/move', data)
  },

  async reorderCards(items) {
    return request('POST', '/cards/reorder', items)
  },

  async getLabels(boardId) {
    return request('GET', '/boards/' + boardId + '/labels')
  },

  async createLabel(boardId, data) {
    return request('POST', '/boards/' + boardId + '/labels', data)
  },

  async updateLabel(id, data) {
    return request('PATCH', '/labels/' + id, data)
  },

  async deleteLabel(id) {
    const res = await fetch(API_URL + '/labels/' + id, { method: 'DELETE', headers: headers() })
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ' + res.status)
    return null
  },

  async getComments(cardId) {
    return request('GET', '/cards/' + cardId + '/comments')
  },

  async addComment(cardId, data) {
    return request('POST', '/cards/' + cardId + '/comments', data)
  },

  async deleteComment(id) {
    const res = await fetch(API_URL + '/comments/' + id, { method: 'DELETE', headers: headers() })
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ' + res.status)
    return null
  },

  async inviteMember(boardId, email) {
    return request('POST', '/boards/' + boardId + '/invitations', { email })
  },

  async getInvitations(boardId) {
    return request('GET', '/boards/' + boardId + '/invitations')
  },

  async respondToInvitation(id, status) {
    return request('PATCH', '/invitations/' + id, { status })
  },

  async cancelInvitation(id) {
    const res = await fetch(API_URL + '/invitations/' + id, { method: 'DELETE', headers: headers() })
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ' + res.status)
    return null
  },

  async removeMember(boardId, userId) {
    const res = await fetch(API_URL + '/boards/' + boardId + '/members/' + userId, { method: 'DELETE', headers: headers() })
    if (!res.ok) throw new Error((await res.json()).error || 'Erreur ' + res.status)
    return null
  },
}

export default demoApi
