class AssertionError extends Error {
  constructor(message, expected, actual) {
    super(message)
    this.name = 'AssertionError'
    this.expected = expected
    this.actual = actual
  }
}

let _currentCategory = null
let _categories = []
let _abort = false
let _baseUrl = ''

function describe(name, fn) {
  _currentCategory = { name, tests: [], beforeEach: null }
  _categories.push(_currentCategory)
  fn()
}

function beforeEach(fn) {
  _currentCategory.beforeEach = fn
}

function it(name, fn) {
  _currentCategory.tests.push({ name, fn })
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new AssertionError(
          `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
          JSON.stringify(expected),
          JSON.stringify(actual)
        )
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual)
      const e = JSON.stringify(expected)
      if (a !== e) {
        throw new AssertionError(`Expected ${e} but got ${a}`, e, a)
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new AssertionError('Expected value to be defined but got undefined', 'defined', 'undefined')
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be truthy`, 'truthy', JSON.stringify(actual))
      }
    },
    toContain(expected) {
      if (!String(actual).includes(expected)) {
        throw new AssertionError(`Expected "${actual}" to contain "${expected}"`, expected, actual)
      }
    },
    toBeGreaterThan(n) {
      if (actual <= n) {
        throw new AssertionError(`Expected ${actual} > ${n}`, `> ${n}`, String(actual))
      }
    },
    toBeLessThan(n) {
      if (actual >= n) {
        throw new AssertionError(`Expected ${actual} < ${n}`, `< ${n}`, String(actual))
      }
    },
  }
}

async function get(path, token) {
  const res = await fetch(_baseUrl + '/api' + path, {
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
  })
  return { status: res.status, data: res.status === 204 ? null : await res.json() }
}

async function post(path, body, token) {
  const res = await fetch(_baseUrl + '/api' + path, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, data: res.status === 204 ? null : await res.json() }
}

async function put(path, body, token) {
  const res = await fetch(_baseUrl + '/api' + path, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, data: res.status === 204 ? null : await res.json() }
}

async function del(path, token) {
  const res = await fetch(_baseUrl + '/api' + path, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
  })
  return { status: res.status, data: res.status === 204 ? null : await res.json() }
}

function defineTests() {
  describe('Authentification', () => {
    let aliceToken = 'token-1'

    beforeEach(async () => {
      await post('/_reset', {})
    })

    it('connecte un utilisateur valide', async () => {
      const { status, data } = await post('/auth/login', { email: 'alice@test.dev', password: 'pass123' })
      expect(status).toBe(200)
      expect(data.token).toBeDefined()
      expect(data.user.name).toBe('Alice')
    })

    it('rejette mauvais mot de passe', async () => {
      const { status, data } = await post('/auth/login', { email: 'alice@test.dev', password: 'wrong' })
      expect(status).toBe(401)
      expect(data.error).toContain('incorrect')
    })

    it('rejette email inconnu', async () => {
      const { status, data } = await post('/auth/login', { email: 'unknown@test.dev', password: 'pass123' })
      expect(status).toBe(401)
    })

    it('retourne le profil', async () => {
      const { status, data } = await get('/auth/me', aliceToken)
      expect(status).toBe(200)
      expect(data.name).toBe('Alice')
    })

    it('rejette la route me sans token', async () => {
      const { status } = await get('/auth/me', '')
      expect(status).toBe(401)
    })
  })

  describe('Todos', () => {
    let aliceToken

    beforeEach(async () => {
      await post('/_reset', {})
      const { data } = await post('/auth/login', { email: 'alice@test.dev', password: 'pass123' })
      aliceToken = data.token
    })

    it('liste les todos', async () => {
      const { status, data } = await get('/todos', aliceToken)
      expect(status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
    })

    it('crée un todo', async () => {
      const { status, data } = await post('/todos', { title: 'Nouveau todo' }, aliceToken)
      expect(status).toBe(201)
      expect(data.title).toBe('Nouveau todo')
      expect(data.completed).toBe(false)
    })

    it('rejette un todo sans titre', async () => {
      const { status, data } = await post('/todos', { title: '' }, aliceToken)
      expect(status).toBe(400)
    })

    it('modifie un todo', async () => {
      const { data: todos } = await get('/todos', aliceToken)
      const todoId = todos[0].id
      const { status, data } = await put('/todos/' + todoId, { title: 'Modifié', completed: true }, aliceToken)
      expect(status).toBe(200)
      expect(data.title).toBe('Modifié')
      expect(data.completed).toBe(true)
    })

    it('supprime un todo', async () => {
      const { data: todos } = await get('/todos', aliceToken)
      const todoId = todos[0].id
      const { status } = await del('/todos/' + todoId, aliceToken)
      expect(status).toBe(204)
    })

    it('retourne 404 pour todo inexistant', async () => {
      const { status } = await del('/todos/999', aliceToken)
      expect(status).toBe(404)
    })

    it('isole les todos par utilisateur', async () => {
      const { data: bob } = await post('/auth/login', { email: 'bob@test.dev', password: 'pass123' })
      const { data: todosAlice } = await get('/todos', aliceToken)
      const { data: todosBob } = await get('/todos', bob.token)
      expect(todosAlice.length).toBe(2)
      expect(todosBob.length).toBe(1)
    })
  })
}

export async function runTests(baseUrl, allowedCategories) {
  _categories = []
  _abort = false
  _baseUrl = baseUrl.replace(/\/$/, '')

  defineTests()

  if (Array.isArray(allowedCategories)) {
    _categories = _categories.filter(category => allowedCategories.includes(category.name))
  }

  const startTime = performance.now()

  for (const category of _categories) {
    for (const test of category.tests) {
      if (_abort) break
      const t0 = performance.now()
      try {
        if (category.beforeEach) await category.beforeEach()
        await test.fn()
        test.status = 'pass'
      } catch (e) {
        test.status = e.name === 'AssertionError' ? 'fail' : 'error'
        test.error = { message: e.message, expected: e.expected || '', actual: e.actual || '' }
      }
      test.duration = Math.round(performance.now() - t0)
      delete test.fn
    }
    if (_abort) break
  }

  const all = _categories.flatMap(c => c.tests)
  return {
    categories: _categories,
    summary: {
      total: all.length,
      passed: all.filter(t => t.status === 'pass').length,
      failed: all.filter(t => t.status === 'fail').length,
      errors: all.filter(t => t.status === 'error').length,
      duration: Math.round(performance.now() - startTime),
    }
  }
}

export function abortTests() {
  _abort = true
}
