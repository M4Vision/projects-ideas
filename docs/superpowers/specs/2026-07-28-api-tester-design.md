# API Tester Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create implementation plan.

**Goal:** Browser-based test runner as a new view in the viewer, where the user enters a ProTask API URL and runs the full 59-test suite with pass/fail results.

**Architecture:** New `protask/api/tester.js` module exports `runTests(baseUrl)` returning structured results. `viewer.js` imports it, renders the tester UI, and displays results grouped by category.

**Tech Stack:** Vanilla JS, fetch API, CSS-only UI (no framework)

---

## Files

| File | Action | Responsibility |
|------|--------|----------------|
| `protask/api/tester.js` | **Create** | Browser-compatible test definitions + mini test-runner. Exports `runTests(baseUrl)` |
| `viewer.js` | **Modify** | Import `runTests`, add `switchView('tester')` handler with UI rendering |
| `index.html` | **Modify** | Add "Testeur" button in view toolbar, add toggle for test view |

## Data Flow

```
User enters URL → clicks "Lancer les tests"
  → viewer.js calls runTests(url)
  → tester.js runs tests sequentially, collecting results
  → returns { categories, summary }
  → viewer.js renders results tree
```

## Test Results Data Structure

```js
{
  categories: [
    {
      name: 'Authentification',
      tests: [
        {
          name: 'inscrit un nouvel utilisateur',
          status: 'pass' | 'fail' | 'error',
          duration: 123,
          error: null | { message: 'Expected 201 but got 400', actual: 'status 400, body: ...', expected: 'status 201' }
        }
      ]
    }
  ],
  summary: { total: 59, passed: 55, failed: 4, duration: 3200 }
}
```

## Module: tester.js

### Mini Test Runner

Browser-compatible replacement for Vitest's `describe`/`it`/`expect`. Collects tests into categories, runs them sequentially, catches failures without throwing.

```js
// Internal state
let _currentCategory = null
let _categories = []
let _abort = false

function describe(name, fn) {
  _currentCategory = { name, tests: [] }
  _categories.push(_currentCategory)
  fn()
}

function it(name, fn) {
  _currentCategory.tests.push({ name, fn })
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new AssertionError(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
    },
    toContain(expected) {
      if (!String(actual).includes(expected)) throw new AssertionError(`Expected "${actual}" to contain "${expected}"`)
    },
    toBeDefined() {
      if (actual === undefined || actual === null) throw new AssertionError(`Expected value to be defined but got ${String(actual)}`)
    },
    toBeUndefined() {
      if (actual !== undefined) throw new AssertionError(`Expected undefined but got ${JSON.stringify(actual)}`)
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new AssertionError(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`)
    },
    toBeGreaterThanOrEqual(n) {
      if (actual < n) throw new AssertionError(`Expected ${actual} >= ${n}`)
    },
    toBeLessThan(n) {
      if (actual >= n) throw new AssertionError(`Expected ${actual} < ${n}`)
    },
  }
}
```

### Test Definitions

Ported from `protask/api/e2e.spec.js`. The same fetch-based helper functions are used: `post()`, `get()`, `put()`, `patch()`, `del()`. Each wraps `fetch()` with JSON parsing and returns `{ status, data }`.

7 categories with the following tests:

**Authentification (7 tests):**
1. register — POST /auth/register with name/email/password → 201, user defined, password absent, token = 'token-' + id
2. duplicate email — second register with same email → 400, error contains 'déjà utilisé'
3. login — POST /auth/login with valid credentials → 200, token defined
4. bad password — login with wrong password → 401, error contains 'incorrect'
5. unknown email — login with unregistered email → 401, error contains 'incorrect'
6. logout — POST /auth/logout → 200, success true
7. _reset — register + reset + login → error (user gone)

**Boards (6 tests):**
1. list boards — GET /boards → 200, array >= 2 items, each has cardCount and members
2. create board — POST /boards with title/color/categories/description → 201, matches input
3. get board detail — GET /boards/:id → 200, has columns (3), members defined
4. update board — PUT /boards/:id with title/description/color/categories → 200, matches updates
5. 404 on unknown — GET /boards/999 → 404, error contains 'introuvable'
6. 401 without token — GET /boards with no auth → 401

**Columns (6 tests):**
1. list columns — GET /boards/:id/columns → 200, 3 items, ordered
2. create column — POST with title/color/description → 201, boardId matches
3. update column — PUT /columns/:id → 200, fields updated
4. delete column — DELETE → 204, remaining count = 2
5. reorder — PUT /columns/reorder → 200, orders swapped
6. 404 unknown — PUT /columns/999 → 404

**Cards (10 tests):**
1. list cards — GET /columns/:id/cards → 200, array, each has assignee and labels
2. create card — POST with full fields → 201, all fields match
3. require title — POST with empty body → 400, error contains 'titre'
4. get card detail — GET /cards/:id → 200, has assignee/labels/comments
5. 404 unknown — GET /cards/999 → 404
6. update card — PATCH /cards/:id → 200, all fields updated
7. assign labels — POST label + PATCH card with labelIds → 200, labels array populated
8. delete card — DELETE → 204, card absent from list
9. move card — POST /cards/:id/move with columnId → 200, columnId changed
10. reorder — POST /cards/reorder → 200, orders swapped

**Labels (6 tests):**
1. list labels — GET /boards/:id/labels → 200, array
2. create label — POST with name/color/description → 201, boardId matches
3. require name — POST empty → 400, error contains 'nom'
4. update — PATCH /labels/:id → 200
5. 404 unknown — PATCH /labels/999 → 404
6. delete — DELETE → 204, absent from list

**Comments (5 tests):**
1. list comments — GET /cards/:id/comments → 200, array
2. add comment — POST with text → 201, author defined
3. require text — POST empty → 400, error contains 'texte'
4. delete — DELETE → 204, absent from list
5. 404 unknown — DELETE /comments/999 → 404

**Invitations (9 tests):**
1. list invitations — GET /boards/:id/invitations → 200, array
2. invite existing member — POST with email → 201, status 'pending'
3. reject invalid email — POST bad email → 400, error contains 'Email invalide'
4. reject self-invite — POST own email → 400, error contains 'pas vous inviter'
5. reject non-existent user — POST unknown email → 404, error contains 'trouvé'
6. reject duplicate pending — POST same email twice → 400, error contains 'en attente'
7. accept invitation — PATCH /invitations/:id with accepted → 200, status 'accepted'
8. decline invitation — PATCH /invitations/:id with declined → 200, status 'declined'
9. wrong user respond — different user tries to accept → 403, error contains 'pas répondre'
10. cancel invitation — DELETE /invitations/:id → 204
11. owner removes member — DELETE /boards/:id/members/:userId → 204

### Main Entry Point

```js
export async function runTests(baseUrl) {
  _categories = []
  _abort = false

  defineTests()  // runs describe/it blocks, populates _categories

  for (const category of _categories) {
    category.tests = category.tests.map(test => ({ ...test })) // clone
  }

  const startTime = Date.now()

  for (const category of _categories) {
    for (const test of category.tests) {
      if (_abort) break
      const t0 = performance.now()
      try {
        await test.fn()
        test.status = 'pass'
      } catch (e) {
        test.status = e.name === 'AssertionError' ? 'fail' : 'error'
        test.error = { message: e.message, expected: e.expected, actual: e.actual }
      }
      test.duration = Math.round(performance.now() - t0)
      delete test.fn  // remove fn before returning
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
      duration: Date.now() - startTime,
    }
  }
}

export function abortTests() {
  _abort = true
}
```

## Viewer Integration

### View Button

In `index.html`, add after the Guide button:
```html
<button class="view-btn" data-view="tester" onclick="window.switchView('tester')">Testeur</button>
```

### Tester View Handler

In `viewer.js`, the `switchView` function gets a new handler for `view === 'tester'`:

1. Hide toggles (no PRD/API/Guide toggles needed)
2. Set `#codeFileName` text to `p.name + ' — Testeur API'`
3. Render the tester UI HTML into `#codeContent`:
   - URL input field (pre-filled from `p.demoApi` pointing to `http://localhost:3001`)
   - "Lancer les tests" button
   - Results area (initially empty)
4. On button click (debounced): call `runTests(url)` and render results

### Tester UI Layout

Single-column layout in `#codeContent`:

```
┌──────────────────────────────────────┐
│ API Base URL                         │
│ [http://localhost:3001/api] [Lancer] │
├──────────────────────────────────────┤
│ Résultats (après exécution)          │
│                                      │
│ ✅ Authentification (7/7)  387ms     │
│  ✅ inscrit un nouvel utilisateur 45ms│
│  ✅ rejette un doublon email     32ms│
│  ...                                 │
│                                      │
│ ❌ Boîtes (5/6)            412ms     │
│  ✅ liste des boards             52ms│
│  ❌ crée un board           FAIL  48ms│
│    Expected 201 but got 400           │
│    body: {"error":"Le titre..."}      │
│  ...                                 │
├──────────────────────────────────────┤
│ Résumé : 56/59 réussis (3 échecs)    │
│ Durée totale : 3.2s                  │
└──────────────────────────────────────┘
```

### CSS

Inline styles within the tester view HTML. Dark theme consistent with the viewer. Categories are collapsible via `<details>`/`<summary>` elements. Failed tests expand automatically.

## Error Handling

- **Network error:** If `fetch()` throws (unreachable host), the test error shows "Network error: connection refused" in red.
- **Timeout:** Each test gets 10s timeout. If exceeded, marked as 'error' with "Timeout exceeded".
- **Abort:** User can click "Arrêter" during execution; sets `_abort = true`, runner stops after current test.
- **Invalid URL:** If base URL doesn't start with `http`, show validation error before running.

## Pre-filled URL Logic

The default API URL is derived from the project config:
- Use `window.location.origin + '/api'` when running through Vite (proxied server)
- Fallback to `http://localhost:3001/api`

The user can override it. The value persists in session memory (not localStorage), but is set back to default when switching projects.

## Testing

- Manual: load a ProTask template, click "Testeur", enter URL, run tests
- The existing `e2e.spec.js` Vitest file remains the CI-based test suite
- `tester.js` tests are the same logic but adapted for browser execution
