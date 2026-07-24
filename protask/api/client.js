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
}

export default demoApi
