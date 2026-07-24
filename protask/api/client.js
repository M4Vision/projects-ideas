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
  // === AUTH ===
  async register(data) {
    const result = await request('POST', '/auth/register', data)
    _token = result.token
    _currentUser = result.user
    return result
  },

  async login(data) {
    const result = await request('POST', '/auth/login', data)
    _token = result.token
    _currentUser = result.user
    return result
  },

  async logout() {
    const result = await request('POST', '/auth/logout')
    _token = null
    _currentUser = null
    return result
  },

  // === USERS ===
  async getMe() {
    const user = await request('GET', '/users/me')
    _currentUser = user
    return user
  },

  async updateMe(data) {
    const user = await request('PUT', '/users/me', data)
    _currentUser = user
    return user
  },

  async getUser(id) {
    return request('GET', '/users/' + id)
  },

  // === BOARDS ===
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

  // === COLUMNS ===
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

  // === CARDS ===
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
    return request('DELETE', '/cards/' + id)
  },

  async moveCard(id, columnId, order) {
    const body = { columnId }
    if (order !== undefined) body.order = order
    return request('POST', '/cards/' + id + '/move', body)
  },

  async reorderCards(items) {
    return request('POST', '/cards/reorder', items)
  },

  // === LABELS ===
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
    return request('DELETE', '/labels/' + id)
  },

  // === COMMENTS ===
  async getComments(cardId) {
    return request('GET', '/cards/' + cardId + '/comments')
  },

  async addComment(cardId, data) {
    return request('POST', '/cards/' + cardId + '/comments', data)
  },

  async deleteComment(id) {
    return request('DELETE', '/comments/' + id)
  },

  // === INVITATIONS ===
  async inviteMember(boardId, email) {
    return request('POST', '/boards/' + boardId + '/invitations', { email })
  },

  async getInvitations(boardId) {
    return request('GET', '/boards/' + boardId + '/invitations')
  },

  async acceptInvitation(id) {
    return request('PATCH', '/invitations/' + id, { status: 'accepted' })
  },

  async respondToInvitation(id, status) {
    return request('PATCH', '/invitations/' + id, { status })
  },

  async cancelInvitation(id) {
    return request('DELETE', '/invitations/' + id)
  },

  async removeMember(boardId, userId) {
    return request('DELETE', '/boards/' + boardId + '/members/' + userId)
  },
}

function getCurrentUser() { return _currentUser }

window.getCurrentUser = getCurrentUser
window.demoApi = demoApi

// API call tracking for e2e tests
;(function() {
  if (window.__apiPatched) return
  window.__apiPatched = true
  window.__apiCalls = window.__apiCalls || new Set()
  for (const key of Object.keys(demoApi)) {
    if (typeof demoApi[key] === 'function') {
      const orig = demoApi[key]
      demoApi[key] = function() {
        window.__apiCalls.add(key)
        return orig.apply(this, arguments)
      }
    }
  }
})()
