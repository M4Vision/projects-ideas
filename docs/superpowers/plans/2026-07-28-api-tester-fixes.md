# API Tester Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 3 issues found in the API tester code review: 2 missing tests, missing fetch timeout, and viewer UI polish.

**Architecture:** 3 independent tasks on two files. Tasks 1-2 modify `protask/api/tester.js`. Task 3 modifies `viewer.js` and `index.html`. No dependencies between tasks.

**Tech Stack:** Vanilla JS (browser), CSS

## Global Constraints

- All test assertions must match `protask/api/e2e.spec.js` verbatim
- `AbortSignal.timeout()` must be used for fetch timeout (no external libs)
- CSS must use existing viewer CSS custom properties (`--bg`, `--fg`, `--border`, `--accent`, `--card`, `--text-secondary`, `--card-hover`)
- Existing `pnpm test:api` Vitest suite must remain passing after all changes
- No `console.log` in production code

---

## Task 1: Add 2 missing tests

**Files:**
- Modify: `protask/api/tester.js`

**Interfaces:**
- Consumes: existing `describe`, `it`, `expect`, `post`, `get`, `del` functions (already defined in tester.js)
- Produces: 2 new test entries in existing categories

- [ ] **Step 1: Add Auth test #8 — demo user seeding**

Insert this test at the end of the `Authentification` category, after the `_reset` test (around line 200):

```js
    it('inscrit les utilisateurs de démo au démarrage', async () => {
      const { data } = await post('/auth/login', { email: 'alex@protask.dev', password: 'pass123' })
      expect(data.user.name).toBe('Alexandre')
    })
```

- [ ] **Step 2: Add Invitations test #12 — non-owner cannot remove member**

Insert this test at the end of the `Invitations` category, after the `retire un membre` test (around line 610):

```js
    it('retourne 403 si non-propriétaire retire un membre', async () => {
      await post('/boards/' + boardId + '/invitations', { email: 'sophie@protask.dev' }, alexToken)
      const { data: invs } = await get('/boards/' + boardId + '/invitations', alexToken)
      const { data: sophie } = await post('/auth/login', { email: 'sophie@protask.dev', password: 'pass123' })
      await patch('/invitations/' + invs[0].id, { status: 'accepted' }, sophie.token)
      const { data: marc } = await post('/auth/login', { email: 'marc@protask.dev', password: 'pass123' })
      const { status } = await del('/boards/' + boardId + '/members/' + sophie.user.id, marc.token)
      expect(status).toBe(403)
    })
```

- [ ] **Step 3: Verify**

```bash
# Start the API server
node protask/api/start.js &
PID=$!
sleep 1

# Run a quick smoke test via Node
node -e "
import { runTests } from './protask/api/tester.js'
const result = await runTests('http://localhost:3001/api')
console.log('Total:', result.summary.total)
console.log('Passed:', result.summary.passed)
console.log('Failed:', result.summary.failed)
// Should show 53 total (was 51)
const authCalls = result.categories.find(c => c.name === 'Authentification').tests
const inviteCalls = result.categories.find(c => c.name === 'Invitations').tests
console.log('Auth tests:', authCalls.length, '(expected 8)')
console.log('Invite tests:', inviteCalls.length, '(expected 12)')
"

kill $PID 2>/dev/null
```

Expected output:
```
Total: 53
Passed: 53
Failed: 0
Auth tests: 8 (expected 8)
Invite tests: 12 (expected 12)
```

- [ ] **Step 4: Commit**

```bash
git add protask/api/tester.js
git commit -m "fix(tester): add 2 missing tests (demo seeding + 403 remove member)"
```

---

## Task 2: Add 10s fetch timeout

**Files:**
- Modify: `protask/api/tester.js`

**Interfaces:**
- Consumes: existing fetch helpers `post`, `get`, `put`, `patch`, `del` (lines 118-143)
- Produces: each helper now uses `AbortSignal.timeout(10000)`. Timeout errors caught as test `'error'` status.

- [ ] **Step 1: Modify each fetch helper to add AbortSignal**

In `protask/api/tester.js`, modify the 5 fetch helpers (lines 118-143). Each gets a `signal` option:

```js
async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, {
    method: 'POST', headers, body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function get(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, {
    headers,
    signal: AbortSignal.timeout(10000)
  })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function put(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, {
    method: 'PUT', headers, body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function patch(path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, {
    method: 'PATCH', headers, body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}

async function del(path, token) {
  const headers = {}
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(_baseUrl + path, {
    method: 'DELETE', headers,
    signal: AbortSignal.timeout(10000)
  })
  const data = res.status === 204 ? null : await res.json()
  return { status: res.status, data }
}
```

- [ ] **Step 2: Verify the tests still pass**

Same verification as Task 1 Step 3 — all 53 tests should pass.

```bash
node protask/api/start.js &
PID=$!
sleep 1
node -e "
import { runTests } from './protask/api/tester.js'
const result = await runTests('http://localhost:3001/api')
console.log('Total:', result.summary.total, '(expected 53)')
console.log('Passed:', result.summary.passed, '(expected 53)')
console.log('Failed:', result.summary.failed, '(expected 0)')
"
kill $PID 2>/dev/null
```

- [ ] **Step 3: Verify timeout actually works (optional)**

Point a request at a dead port — the test should time out and report `error` instead of hanging forever:

```bash
node -e "
import { runTests } from './protask/api/tester.js'
console.time('timeout')
const result = await runTests('http://localhost:19999/api')
console.timeEnd('timeout')
const errors = result.summary.errors
console.log('Tests with errors:', errors, '(should be > 0 — requests to dead port timed out)')
" 2>/dev/null
```

Expected: `timeout` logs under ~12 seconds (10s timeout + overhead), `errors > 0`.

- [ ] **Step 4: Commit**

```bash
git add protask/api/tester.js
git commit -m "fix(tester): add 10s AbortSignal timeout to all fetch helpers"
```

---

## Task 3: Viewer polish

**Files:**
- Modify: `viewer.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `runTests` (already imported at line 5), `abortTests` from tester.js
- Produces: cleaner viewer code with proper imports, animated progress, rich error display

#### Sub-step 3.1: Static import of abortTests

- [ ] **Step 3.1 — Add `abortTests` to the import at line 5 in viewer.js**

Change:
```js
import { runTests } from './protask/api/tester.js'
```
To:
```js
import { runTests, abortTests } from './protask/api/tester.js'
```

Then replace the dynamic import in `window._abortTests` (around line 365):
```js
window._abortTests = async function () {
  const { abortTests } = await import('./protask/api/tester.js')
  abortTests()
  document.getElementById('testerAbortBtn').style.display = 'none'
}
```
With:
```js
window._abortTests = function () {
  abortTests()
  document.getElementById('testerAbortBtn').style.display = 'none'
}
```

#### Sub-step 3.2: Progress bar animation

- [ ] **Step 3.2 — Replace static progress bar with CSS indeterminate animation**

In `index.html`, replace the `.tester-progress-fill` CSS block:

```css
.tester-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  width: 0;
  transition: width .3s
}
```

With:

```css
.tester-progress-bar {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
  position: relative
}
.tester-progress-fill {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, var(--accent), var(--accent-hover));
  border-radius: 2px;
  position: absolute;
  animation: tester-indeterminate 1.5s ease-in-out infinite
}
@keyframes tester-indeterminate {
  0% { left: -40% }
  100% { left: 100% }
}
```

#### Sub-step 3.3: Display expected/actual in error details

- [ ] **Step 3.3 — Enrich the error display HTML in viewer.js**

In `window._runTests` (around line 335 in viewer.js), find this:
```js
if (test.error) {
  html += `<div class="tester-test-error">${test.error.message}</div>`
}
```

Replace with:
```js
if (test.error) {
  html += `<div class="tester-test-error">`
  html += `<div>${test.error.message}</div>`
  if (test.error.expected || test.error.actual) {
    html += `<div style="margin-top:4px;display:flex;gap:12px;font-size:11px">`
    if (test.error.expected !== undefined && test.error.expected !== '') {
      html += `<span style="color:#22C55E">attendu: ${test.error.expected}</span>`
    }
    if (test.error.actual !== undefined && test.error.actual !== '') {
      html += `<span style="color:#e06c75">reçu: ${test.error.actual}</span>`
    }
    html += `</div>`
  }
  html += `</div>`
}
```

#### Sub-step 3.4: Clean up scope creep

- [ ] **Step 3.4 — Remove `window.__getHL` from viewer.js**

Find and remove this line:
```js
window.__getHL = () => _highlighter
```

- [ ] **Step 3.5 — Keep `fetchRawJs` but justify it**

`fetchRawJs` was added in a previous session to fix the API client highlighting (shiki JS grammar backtracking with Vite-transformed files). It is used by the `apiclient` view handler. Keep it — add a one-line comment at its definition:

```js
// Fetch .js via ?raw to bypass Vite transformation (avoids shiki backtracking on large transformed files)
async function fetchRawJs(path) {
```

#### Sub-step 3.6: Verify

- [ ] **Step 3.6 — Manual verification**

```bash
# Check syntax
node --check viewer.js

# If dev server is running, open browser and verify:
# 1. "Testeur" button works
# 2. Progress bar animates during test run
# 3. Errors show expected/actual details
# 4. "Arrêter" button works without dynamic import
```

- [ ] **Step 3.7: Commit**

```bash
git add viewer.js index.html
git commit -m "fix(viewer): static abortTests import, animated progress, rich error display, cleanup"
```