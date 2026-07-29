# Learning-Path Pattern — Inventory (AdonisJS Pilot)

> Research Ticket #1 — Source of truth for the `write-guide-docs` skill.
> Analyzed from `protask/guides/adonis/` — the only existing pilot implementation.

---

## 1. Structure du manifest (`learning-path.js`)

**File:** `protask/guides/adonis/learning-path.js`

**Export:** `export default { ... }` — a plain JS object, no TypeScript types.

### Top-level fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | `string` | ✅ | Display title of the learning path | `"Construire ProTask avec AdonisJS"` |
| `framework` | `string` | ✅ | Framework name + version label | `"AdonisJS 6"` |
| `prerequisites` | `string[]` | ✅ | Array of prerequisite descriptions | `["Node.js v24+", "pnpm", "Bases de TypeScript", "Notions HTTP"]` |
| `lessons` | `Lesson[]` | ✅ | Array of lesson objects | (see below) |

### Lesson object fields

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| `id` | `string` | ✅ | `{NN}-{kebab-slug}` — zero-padded number + lowercase kebab | `"01-start"` |
| `title` | `string` | ✅ | Human-readable title (French) | `"Démarrer un projet AdonisJS"` |
| `durationMinutes` | `number` | ✅ | Estimated completion time | `15` |
| `summary` | `string` | ✅ | Single-sentence description | `"Installer AdonisJS, créer le projet..."` |
| `file` | `string` | ✅ | Relative path from repo root to lesson markdown | `"protask/guides/adonis/lessons/01-start.md"` |
| `files` | `string[]` | ✅ | File paths created/modified in this lesson | `["package.json", "tsconfig.json", ...]` |
| `checkpoint` | `string` | ✅ | Path to checkpoint directory (trailing slash) | `"protask/guides/adonis/checkpoints/01-start/"` |
| `testCategories` | `string[]` | ✅ | Filters which `describe()` blocks run. Empty = no tests. | `[]` or `["Authentification", "Boards"]` |
| `quiz` | `QuizItem[]` | ✅ | Array of quiz questions (can be empty) | (see §4) |

### Notable observations

- **`testCategories: []`** means "no tests for this lesson" — not "run all tests". Lessons 01 and 02 have empty arrays because they only set up the project skeleton.
- **`files` lists paths relative to the AdonisJS project root** (e.g. `start/routes.ts`), not relative to the repo root. They describe what changes inside the learner's project.
- **`checkpoint` path has a trailing slash** in all entries — this is consistent but could be normalized.
- **All lessons have a `quiz` array** — even if it could theoretically be empty, every current lesson has exactly 2 quiz questions.
- The manifest is not validated anywhere — it's consumed directly by whatever viewer/player reads it.

---

## 2. Structure des leçons

**Directory:** `protask/guides/adonis/lessons/`

**Naming:** `{NN}-{slug}.md` — e.g. `01-start.md`, `05-current-user.md`, `09-next-steps.md`

**Slug language:** Mix of English (`01-start`, `02-first-server`, `07-kanban-core`, `09-next-steps`) and French (`04-persistence` — actually English, `03-authentication`, `05-current-user`, `06-boards`, `08-collaboration`). No strict rule enforced.

### Required sections (in order)

| Section heading | Appears in | Content type | Description |
|----------------|------------|-------------|-------------|
| `## Objectif` | All | 1 paragraph | Single goal statement |
| `## Ce que tu vas obtenir` | All | Bullet list | Concrete deliverables after the lesson |
| `## Pourquoi maintenant ?` | All | 1-2 paragraphs | Pedagogical justification for timing |
| `## Fais-le avec moi` | All | Steps with code blocks | The main instructional content |
| `## Vérifie maintenant` | All | Commands or manual steps | How the learner verifies success |
| `## Si cela échoue` | All (except 09) | Bullet list of error cases | Troubleshooting (lesson 09 also has it) |
| `<details><summary>Code complet</summary>` | All | Collapsible | References the checkpoint folder |

### Section `## Fais-le avec moi` patterns

- Subsections use `### N. Title` — e.g. `### 1. Créer le projet`
- Code blocks are fenced with language identifiers: `typescript`, `bash`
- File paths are mentioned inline as **bold text**, not in frontmatter
- Each step provides the actual code to write, not a description of what to write

### Code block conventions

- TypeScript code blocks show imports, full class/function definitions
- Bash code blocks show commands to run (prefixed with `#` comments for context)
- `curl` examples are used for API verification
- Code blocks never have filenames as headers — filenames are stated in the preceding text

### No YAML frontmatter

Lesson files have **no YAML frontmatter**. All metadata is in the manifest. This decouples content from structure.

### Length

| Lesson | Lines |
|--------|-------|
| `01-start.md` | 65 |
| `02-first-server.md` | ~52 |
| `03-authentication.md` | ~68 |
| `04-persistence.md` | ~74 |
| `05-current-user.md` | 115 |
| `06-boards.md` | ~83 |
| `07-kanban-core.md` | 134 |
| `08-collaboration.md` | ~98 |
| `09-next-steps.md` | 85 |

Range: ~50–135 lines. Earlier lessons are shorter, later lessons are longer.

### Special patterns

- **Final lesson** (09) adds `## Félicitations ! 🎉` with a summary of what was learned.
- **Links to checkpoints** use the pattern: `Voir le dossier d'état : protask/guides/adonis/checkpoints/{NN}-{slug}/`
- **Inline directives**: "Fichiers créés : ..." and "Fichiers modifiés : ..." inside the `<details>` block.
- No admonitions, callouts, or custom containers — plain Markdown only.

---

## 3. Structure des checkpoints

**Directory:** `protask/guides/adonis/checkpoints/`

**Naming:** One directory per lesson, named exactly like the lesson ID (e.g. `01-start/`, `05-current-user/`).

### Principle: cumulative snapshots

Each checkpoint contains the **full project state** after completing that lesson. Checkpoints are not incremental diffs — they duplicate files from earlier checkpoints.

### File progression

| Checkpoint | File count | Key additions |
|------------|------------|---------------|
| `01-start/` | 14 | Project skeleton: `package.json`, `tsconfig.json`, `adonisrc.js`, `env.ts`, `.env`, `config/` (4 files), `bin/` (2 files), `start/kernel.ts`, `README.md` |
| `02-first-server/` | ~17 | Adds `start/routes.ts`, `app/controllers/AuthController.ts` |
| `03-authentication/` | ~18 | Modifies `routes.ts`, `AuthController.ts` |
| `04-persistence/` | ~20 | Adds `app/models/User.ts`, `database/migrations/1725000000000_create_users.ts`, config changes |
| `05-current-user/` | 23 | Adds `app/controllers/UsersController.ts`, `app/middleware/MockAuthMiddleware.ts` |
| `06-boards/` | ~28 | Adds `app/models/Board.ts`, `app/models/ProjectColumn.ts`, `app/controllers/BoardsController.ts` |
| `07-kanban-core/` | ~32 | Adds `app/models/Card.ts`, `app/controllers/ColumnsController.ts`, `app/controllers/CardsController.ts` |
| `08-collaboration/` | ~38 | Adds `app/models/Label.ts`, `app/models/Comment.ts`, `app/models/Invitation.ts`, 3 more controllers |
| `09-next-steps/` | 43 | Adds `database/seeders/seed.ts`, `app/controllers/ResetController.ts`, `debug.ts` |

### README format

Every checkpoint has a `README.md` at its root:

```markdown
# Checkpoint: 01-start
Pour lancer : node bin/server.ts
```

That's it — 2 lines. The README serves only as a label and a launch instruction.

### Included files per checkpoint

The files mirror a real AdonisJS project structure:
```
{checkpoint}/
├── README.md
├── package.json
├── tsconfig.json
├── adonisrc.js
├── .env
├── env.ts
├── bin/
│   ├── server.ts
│   └── console.ts
├── config/
│   ├── app.ts
│   ├── bodyparser.ts
│   ├── cors.ts
│   ├── database.ts
│   └── logger.ts
├── start/
│   ├── kernel.ts
│   └── routes.ts
├── app/
│   ├── controllers/
│   ├── middleware/
│   └── models/
├── database/
│   ├── migrations/
│   └── seeders/
└── debug.ts (lesson 09+)
```

### Notable observations

- **No `player/` or `viewer/` directory exists** in the checkpoints. The checkpoints are pure project snapshots, not interactive content.
- **`debug.ts` appears only in the final checkpoint** — it's a utility, not part of the pedagogical content.
- **Migrations use Unix timestamp prefixes** (e.g. `1725000000000_create_users.ts`) — consistent with AdonisJS conventions.
- **Checkpoint file sets are not documented anywhere** except in the lesson's `<details>` block.

---

## 4. Format des quizzes

**Location:** `lesson.quiz[]` in the manifest

### Quiz question object

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| `question` | `string` | ✅ | French question text | `"Quel outil AdonisJS gère les dépendances et l'environnement ?"` |
| `choices` | `string[4]` | ✅ | Exactly 4 answer strings | `["Node.js", "AdonisJS Core", "IoC Container", "pnpm"]` |
| `answer` | `number` | ✅ | 0-based index of the correct choice | `2` |
| `explanation` | `string` | ✅ | French explanation of why it's correct | `"AdonisJS utilise un conteneur IoC..."` |

### Constraints observed

- **Exactly 4 choices** — all quizzes have exactly 4 options. No variation found.
- **Answer index is always 0-3** — verified across all 18 questions (2 per lesson × 9 lessons).
- **Questions are French** — consistent with the audience.
- **Explanations are 1-2 sentences** — they explain the concept, not just restate the answer.
- **Questions test conceptual understanding**, not code recall — they ask "why" and "what" not "type what".

### Example (from lesson 01):

```js
{
  question: "Quel outil AdonisJS gère les dépendances et l'environnement ?",
  choices: ["Node.js", "AdonisJS Core", "IoC Container", "pnpm"],
  answer: 2,
  explanation: "AdonisJS utilise un conteneur IoC (Inversion of Control) pour résoudre les dépendances automatiquement."
}
```

---

## 5. Système de catégories de tests

**File:** `protask/api/tester.js` — a standalone test runner (675 lines).

### Architecture

`tester.js` is a **self-contained test framework** with its own assertion library. It does not use Vitest, Jest, or any external test framework. Exports:

```js
export async function runTests(baseUrl, allowedCategories)
export function abortTests()
```

### How `defineTests()` works

The function `defineTests()` registers all test categories using a custom DSL:

```js
describe('Authentification', () => {
  beforeEach(async () => { ... })
  it('inscrit un nouvel utilisateur', async () => { ... })
  it('rejette un doublon email', async () => { ... })
  // ...
})
```

### Category → `describe()` block mapping

| `describe()` name | Number of tests | Test coverage |
|-------------------|-----------------|---------------|
| `"Authentification"` | 8 (or 9 counting reset) | register, duplicate, login, wrong password, unknown email, logout, reset, demo users |
| `"Boards"` | 5 | list, create, get, update, 404, 401 |
| `"Colonnes"` | 5 | list, create, update, delete, reorder, 404 |
| `"Cartes"` | 10 | list, create, require title, get, 404, update, assign labels, delete, move, reorder |
| `"Labels"` | 5 | list, create, require name, update, 404, delete |
| `"Commentaires"` | 4 | list, create, require text, delete, 404 |
| `"Invitations"` | 11 | list, invite, invalid email, self-invite, unknown user, already invited, accept, decline, wrong user, cancel, remove member, non-owner remove |

### How `testCategories` filters

```js
// In runTests():
if (Array.isArray(allowedCategories)) {
  _categories = _categories.filter(
    category => allowedCategories.includes(category.name)
  )
}
```

So `testCategories: ["Authentification", "Boards"]` in the manifest means: only run the `describe("Authentification", ...)` and `describe("Boards", ...)` blocks.

### What happens if `testCategories` is empty?

```js
// filtered: _categories becomes []
// sum: total: 0, passed: 0, failed: 0, errors: 0
```

An empty array produces a "0 tests run" result. The lesson 01 and 02 use this because they only set up configuration.

### Helper HTTP functions

The tester provides `get()`, `post()`, `put()`, `patch()`, `del()` that:
- Accept a path (e.g. `/auth/login`), optional body, optional token
- Return `{ status, data }`
- Use `AbortSignal.timeout(10000)` for timeout
- Handle 204 No Content responses

### Assertion matchers

| Matcher | Description |
|---------|-------------|
| `toBe(expected)` | Strict equality (`===`) |
| `toEqual(expected)` | JSON-stringified comparison |
| `toContain(expected)` | String includes |
| `toBeDefined()` | `!== undefined` |
| `toBeUndefined()` | `=== undefined` |
| `toBeTruthy()` | Truthy check |
| `toBeGreaterThan(n)` | `> n` |
| `toBeGreaterThanOrEqual(n)` | `>= n` |
| `toBeLessThan(n)` | `< n` |

---

## 6. Viewer consumption

**`player/viewer.js` does NOT exist.** There is no viewer/player implementation in the codebase yet.

The `/player/` directory is referenced in CONTEXT.md and in the ticket but has not been built. The ticket says to document how `renderLesson`, `renderQuiz`, `_runLessonChecks` consume the manifest — but these functions don't exist yet.

### What we know about the future viewer

From context:
- The viewer will **consume the manifest** (`learning-path.js`) to navigate lessons
- It will **render lesson content** (Markdown → HTML)
- It will **render quizzes** from the `quiz` array
- It will **run test categories** via `tester.js` for the current lesson
- It will be part of the **Guide view** in the project browser (mentioned in `index.md`)

### What must be inferred for the skill:

The viewer will need:
- **`renderLesson(lesson)`** — read `lesson.file`, render Markdown, display sections
- **`renderQuiz(lesson.quiz)`** — display questions, choices, handle submission, reveal explanation
- **`_runLessonChecks(lesson.testCategories)`** — call `tester.runTests(baseUrl, lesson.testCategories)`, display results
- **State tracking** — which lesson is active, completion status, quiz scores

---

## 7. Conventions de nommage

### Directory structure

```
protask/guides/adonis/                      ← {projet}/guides/{framework}/
├── learning-path.js                        ← manifest
├── index.md                                 ← landing page
├── archive/                                 ← previous monolithic version
├── lessons/                                 ← lesson markdown files
│   ├── 01-start.md
│   ├── 02-first-server.md
│   └── ...
├── checkpoints/                             ← cumulative project snapshots
│   ├── 01-start/
│   ├── 02-first-server/
│   └── ...
├── app/ ...                                 ← (part of checkpoint content, not guide code)
├── config/ ...
└── ...
```

### File naming rules

| Entity | Pattern | Example | Notes |
|--------|---------|---------|-------|
| Manifest | `learning-path.js` | `learning-path.js` | Always lowercase, no variant |
| Lesson file | `{NN}-{slug}.md` | `01-start.md` | Zero-padded number, kebab-case slug |
| Lesson ID | `{NN}-{slug}` | `01-start` | Same as filename without `.md` |
| Checkpoint directory | `{lesson-id}/` | `01-start/` | Exactly matches lesson ID |
| Checkpoint README | `README.md` | `README.md` | Standard, 2 lines |
| Index | `index.md` | `index.md` | Standard |

### Lesson ID conventions

- **Numbers are 0-based, zero-padded to 2 digits:** `01` through `09`
- **Slug is kebab-case** — lowercase, hyphens between words
- **Slug language:** predominantly English, mixed with some French/francophone terms:
  - English: `start`, `first-server`, `kanban-core`, `next-steps`
  - Mixed: `authentication`, `persistence`, `current-user`, `boards`, `collaboration`
- **Slug describes the action or concept**, not the lesson number

### testCategories naming

Test category strings match the `describe()` block names in `tester.js`:
- Capitalized French: `"Authentification"`, `"Boards"`, `"Colonnes"`, `"Cartes"`, `"Labels"`, `"Commentaires"`, `"Invitations"`
- These strings must be consistent between the manifest and `defineTests()`

---

## Summary of conventions for skill authors

When creating a `write-guide-lesson` or `write-guide-docs` skill:

1. **Manifest** is the single source of truth — all metadata lives there, not in frontmatter.
2. **Lesson files** are pure Markdown without YAML — sections are predictable and ordered.
3. **Checkpoints** are cumulative snapshots with a minimal README.
4. **Quizzes** are always 4-choice with a 0-based answer index.
5. **Test categories** map 1:1 to `describe()` blocks in `tester.js`.
6. **Viewer** does not exist yet — it must be built as part of the pattern.
7. **Directories** follow `{project}/guides/{framework}/` structure.
8. **No player/viewer exists** — the interactive consumption layer is yet to be implemented.
