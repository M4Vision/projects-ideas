# AdonisJS Pedagogical Guide Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long AdonisJS guide with a dark, navigable learning path that lets a beginner build, verify, understand, and safely modify the ProTask API.

**Architecture:** Keep the existing `index.html` shell and its dark design tokens as the visual source of truth. Add a declarative learning-path manifest for AdonisJS; `viewer.js` renders it as the chosen “Atelier & fichiers” layout. The existing browser test runner gains an optional category filter so each learning block can run only the API behaviours the reader has implemented; quizzes remain client-side learning checks, never gates.

**Tech Stack:** Static HTML/CSS/vanilla JavaScript, Vite, MarkdownIt/Shiki, the existing browser API tester, AdonisJS 6/TypeScript source project.

## Global Constraints

- Preserve unrelated uncommitted changes in `data.js`, `index.html`, and `viewer.js`.
- Reuse `index.html` tokens exactly: `--bg #0A0A0A`, `--fg #EDEDED`, `--border #232323`, `--accent #3B82F6`, `--accent-hover #2563EB`, `--card #141414`, `--card-hover #1A1A1A`, `--text-secondary #888`, and `--radius 8px`.
- French prose and UI copy; English code identifiers and source code.
- The learner provides an API Base URL; browser checks never silently target another API.
- Code snippets come before a collapsed complete solution and a read-only checkpoint link.
- Quiz answers show an explanation immediately; no score blocks navigation.
- Do not change the ProTask API contract or AdonisJS implementation merely to support the guide.

---

## File Inventory

### Create

- `protask/guides/adonis/learning-path.js` — manifest: chapters, lessons, snippets, touched files, checkpoint path, test categories, and quizzes.
- `protask/guides/adonis/lessons/01-start.md` through `09-next-steps.md` — concise lesson prose, each independently readable.
- `protask/guides/adonis/checkpoints/01-start/` through `09-next-steps/` — read-only source snapshots, one state per completed lesson.
- `e2e/guide-learning-path.spec.js` — browser-level regression tests for the path UI, quiz behaviour, and test-category selection.

### Modify

- `data.js` — identify AdonisJS as a `learning-path` guide and point to its manifest.
- `viewer.js` — load the manifest, render the Atelier & fichiers guide, and pass selected categories to the existing tester.
- `index.html` — add only the guide-specific classes required by the renderer, using existing CSS tokens.
- `protask/api/tester.js` — expose category metadata and accept an optional category allow-list in `runTests(baseUrl, categories)`.
- `protask/guides/adonis/index.md` — replace the monolithic reader entry point with a short redirect/explanation that the interactive path is the canonical guide.

## Learning Map

| Lesson | Reader result | Tester categories | Quiz focus |
|---|---|---|---|
| 01 Start | environment and project start | none | tools and HTTP request lifecycle |
| 02 First server | server answers `/api/health` or first public route | none | controller versus route |
| 03 Authentication | register, login, logout | `Authentification` | validation, token, controller |
| 04 Persistence | SQLite, migration, User model | `Authentification` | migration and model responsibility |
| 05 Current user and guard | protected user route | `Authentification` | middleware and bearer token |
| 06 Boards | authenticated board CRUD | `Authentification`, `Boards` | ownership and resource routes |
| 07 Kanban core | columns and cards | add `Colonnes`, `Cartes` | relationship and ordering |
| 08 Collaboration | labels, comments, invitations | add `Labels`, `Commentaires`, `Invitations` | authorization and related resources |
| 09 Finish and change | shared suite and a small independent alteration | all categories | locating a change across files |

### Task 1: Add filterable categories to the browser test runner

**Files:**
- Modify: `protask/api/tester.js`
- Test: `e2e/guide-learning-path.spec.js`

**Interfaces:**
- Produces `runTests(baseUrl: string, allowedCategories?: string[]): Promise<TestResult>`.
- `allowedCategories` is an allow-list by the exact `describe()` name; `undefined` executes the complete suite.

- [ ] **Step 1: Write the failing runner assertions**

Create a browser test which imports the runner and verifies that `runTests(baseUrl, ['Authentification'])` returns only one category named `Authentification`, while `runTests(baseUrl)` still returns every category.

- [ ] **Step 2: Run the focused test and confirm the filter is absent**

Run: `pnpm playwright test e2e/guide-learning-path.spec.js`

Expected: FAIL because the second argument is ignored or the test file does not yet exist.

- [ ] **Step 3: Filter after `defineTests()` and before execution**

Change the exported signature to:

```js
export async function runTests(baseUrl, allowedCategories) {
  _categories = []
  _abort = false
  _baseUrl = baseUrl.replace(/\/$/, '')
  defineTests()
  if (Array.isArray(allowedCategories)) {
    _categories = _categories.filter(category => allowedCategories.includes(category.name))
  }
  // retain the existing execution loop and summary
}
```

- [ ] **Step 4: Verify both partial and full runs**

Run: `pnpm playwright test e2e/guide-learning-path.spec.js`

Expected: PASS; the unfiltered tester remains backward compatible.

- [ ] **Step 5: Commit**

```bash
git add protask/api/tester.js e2e/guide-learning-path.spec.js
git commit -m "feat: filter browser API tester by category"
```

### Task 2: Define the AdonisJS learning-path manifest and lesson files

**Files:**
- Create: `protask/guides/adonis/learning-path.js`
- Create: `protask/guides/adonis/lessons/*.md`
- Create: `protask/guides/adonis/checkpoints/*`

**Interfaces:**
- `learning-path.js` exports `{ title, framework, prerequisites, lessons }`.
- Every lesson object contains `id`, `title`, `durationMinutes`, `summary`, `file`, `files`, `checkpoint`, `testCategories`, and `quiz`.

- [ ] **Step 1: Create the manifest contract**

```js
export default {
  title: 'Construire ProTask avec AdonisJS',
  framework: 'AdonisJS 6',
  prerequisites: ['Node.js v24+', 'pnpm', 'Bases de TypeScript', 'Notions HTTP'],
  lessons: [{
    id: '03-authentication', title: 'Créer une connexion utile', durationMinutes: 20,
    file: 'protask/guides/adonis/lessons/03-authentication.md',
    files: ['start/routes.ts', 'app/controllers/AuthController.ts'],
    checkpoint: 'protask/guides/adonis/checkpoints/03-authentication/',
    testCategories: ['Authentification'],
    quiz: [{ question: 'Pourquoi renvoyer un token après la connexion ?', choices: ['Pour identifier les requêtes suivantes', 'Pour chiffrer SQLite', 'Pour démarrer le serveur'], answer: 0, explanation: 'Le client présente ce token aux routes protégées.' }]
  }]
}
```

- [ ] **Step 2: Write the nine lesson files from the learning map**

Each Markdown file follows this exact order: `Objectif`, `Ce que tu vas obtenir`, `Pourquoi maintenant ?`, `Fais-le avec moi`, one small annotated code fence, `Vérifie maintenant`, `Si cela échoue`, `Code complet`. Keep each lesson under roughly 10 minutes of uninterrupted reading; split a concept rather than adding a long code dump.

- [ ] **Step 3: Build checkpoints from the existing working Adonis source**

Copy only the files necessary to run each state; add `README.md` to every checkpoint with the command to start it and the completed lesson title. Do not copy `node_modules`, `data.db`, or generated output.

- [ ] **Step 4: Verify checkpoints are navigable and source-backed**

Run: `find protask/guides/adonis/checkpoints -name node_modules -o -name data.db`

Expected: no output. Manually verify every manifest `file` and `checkpoint` path exists.

- [ ] **Step 5: Commit**

```bash
git add protask/guides/adonis/learning-path.js protask/guides/adonis/lessons protask/guides/adonis/checkpoints
git commit -m "docs: add progressive AdonisJS learning content"
```

### Task 3: Render the Atelier & fichiers learning path in the existing guide view

**Files:**
- Modify: `data.js`
- Modify: `viewer.js`
- Modify: `index.html`
- Test: `e2e/guide-learning-path.spec.js`

**Interfaces:**
- `data.js` guide entry adds `format: 'learning-path'` and `file: 'protask/guides/adonis/learning-path.js'`.
- `viewer.js` adds `renderLearningPath(manifest)` and preserves Markdown rendering for every other guide.

- [ ] **Step 1: Write browser assertions for the reader**

Assert that the Guide view displays: the prerequisite list, nine numbered lessons, current lesson title, its touched-file list, a collapsed `Code complet` section, and a `Vérifier mon étape` button. Assert selecting lesson 03 sets the selected button and renders its content.

- [ ] **Step 2: Load a manifest without using `eval`**

In `viewer.js`, add a dedicated dynamic import for a guide entry whose `format` is `learning-path`:

```js
const manifest = (await import('/' + guide.file)).default
await renderLearningPath(manifest)
```

Do not run this path for existing Markdown guide entries.

- [ ] **Step 3: Render the selected layout using canonical CSS tokens**

Render a three-pane responsive layout: lesson navigation on the left, lesson content in the centre, and touched files/checkpoint in the right pane. On narrow screens stack the panes and keep the current lesson navigation visible above the content. Use `var(--bg)`, `var(--card)`, `var(--border)`, `var(--fg)`, `var(--text-secondary)`, and `var(--accent)`; do not introduce a second palette.

- [ ] **Step 4: Implement progressive disclosure**

Render `Code complet` as a native `<details>` element closed by default. Its body links to the checkpoint and displays the exact files supplied by `lesson.files`. It must not fetch or overwrite the learner's project.

- [ ] **Step 5: Run browser tests and build**

Run: `pnpm playwright test e2e/guide-learning-path.spec.js && pnpm build`

Expected: PASS and a successful Vite build.

- [ ] **Step 6: Commit**

```bash
git add data.js viewer.js index.html e2e/guide-learning-path.spec.js
git commit -m "feat: render AdonisJS learning path in guide viewer"
```

### Task 4: Connect the step verifier and its beginner-focused diagnosis

**Files:**
- Modify: `viewer.js`
- Test: `e2e/guide-learning-path.spec.js`

**Interfaces:**
- `runLessonChecks(lesson)` reads the visible `API Base URL` and calls `runTests(url, lesson.testCategories)`.
- It is disabled only when `lesson.testCategories.length === 0`, with copy explaining that no API feature is available yet.

- [ ] **Step 1: Write tests for lesson-specific execution**

Select lesson 03, fill `http://localhost:3333/api`, trigger verification, and stub `runTests` to assert it receives `['Authentification']`. Select lesson 06 and assert it receives `['Authentification', 'Boards']`.

- [ ] **Step 2: Render the shared API Base URL control in the guide**

Label it exactly `API Base URL`. Initialise it from `window.location.origin + '/api'`, validate `http://` or `https://`, and reuse its value for each selected lesson. Do not add another endpoint-setting mechanism.

- [ ] **Step 3: Reuse existing result details and add an actionable preface**

Above the existing pass/fail category details, render: `Cette vérification couvre : ${lesson.testCategories.join(', ')}`. For failure, render `Relis l'étape « Vérifie maintenant » puis compare ton fichier avec le code complet.` before the existing expected/received values.

- [ ] **Step 4: Verify in a real Adonis server session**

Run: `pnpm --dir protask/guides/adonis dev`

Run: `pnpm playwright test e2e/guide-learning-path.spec.js`

Expected: the Auth block reports its partial result against `http://localhost:3333/api`.

- [ ] **Step 5: Commit**

```bash
git add viewer.js e2e/guide-learning-path.spec.js
git commit -m "feat: verify each guide block against selected API"
```

### Task 5: Add non-blocking, explained quizzes

**Files:**
- Modify: `viewer.js`
- Test: `e2e/guide-learning-path.spec.js`

**Interfaces:**
- `renderQuiz(quiz)` renders each `question`, `choices`, `answer`, and `explanation` from the manifest.
- Selecting an answer reveals an explanation immediately and does not disable lesson navigation or verification.

- [ ] **Step 1: Write browser tests for correct and incorrect answers**

For the lesson 03 quiz, assert that a wrong choice renders the stored explanation and leaves lesson 04 selectable. Reload, choose the correct answer, and assert the same explanation plus `Bonne intuition` is shown. Assert no percentage, score, or blocking state is rendered.

- [ ] **Step 2: Render semantic choices**

Use a `<fieldset>` with a `<legend>` question and one `<button type="button">` per choice. On click, set `aria-pressed`, reveal a live region with the explanation, and add either `Bonne intuition` or `Regarde cette explication`.

- [ ] **Step 3: Verify keyboard use and build**

Run: `pnpm playwright test e2e/guide-learning-path.spec.js && pnpm build`

Expected: PASS; choices are reachable by keyboard and no production build warning occurs.

- [ ] **Step 4: Commit**

```bash
git add viewer.js e2e/guide-learning-path.spec.js
git commit -m "feat: add explained quizzes to learning path"
```

### Task 6: Retire the monolithic entry point and validate the pilot

**Files:**
- Modify: `protask/guides/adonis/index.md`
- Test: `e2e/guide-learning-path.spec.js`

- [ ] **Step 1: Replace the old entry prose with a short migration notice**

Keep a title, explain that the interactive learning path is the canonical guide, link to the guide view, and retain a link to the previous long-form content only if it is moved to `protask/guides/adonis/archive/index.md`.

- [ ] **Step 2: Run the learner acceptance route**

Perform this route in the browser: open AdonisJS Guide; read prerequisites; complete lesson 03; enter the Adonis `API Base URL`; run partial Authentication checks; answer one incorrect and one correct quiz choice; open the checkpoint; select lesson 06; then locate the route file from its touched-file panel.

Expected: all actions are understandable without leaving the guide except to edit/run the learner project.

- [ ] **Step 3: Run the full safety suite**

Run: `pnpm build && pnpm test:api && pnpm playwright test`

Expected: all commands pass. If the Adonis server is intentionally absent, record that only the browser's mocked runner assertions ran; do not mark the guide acceptance route as complete.

- [ ] **Step 4: Commit**

```bash
git add protask/guides/adonis/index.md e2e/guide-learning-path.spec.js
git commit -m "docs: promote AdonisJS learning path pilot"
```

## Self-Review

- Spec coverage: Tasks 2–3 implement the short navigable lessons, progressive code and Atelier layout; Task 3 uses the canonical dark design system; Tasks 1 and 4 implement partial tests on API Base URL; Task 5 implements non-blocking explained quizzes; Task 6 exercises the agreed beginner success criteria.
- Placeholder scan: no unresolved placeholder steps; every code change has paths, an interface, a validation command, and a commit.
- Consistency: `lesson.testCategories` is defined by the manifest, passed by `runLessonChecks`, and filtered by `runTests(baseUrl, allowedCategories)`.
