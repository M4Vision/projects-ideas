---
name: write-guide-docs
description: Use when you need to create a pedagogical guide (learning-path) for a project+framework combination, or when asked to scaffold lessons/checkpoints/quizzes/tests for a guided tutorial.
---

# write-guide-docs

## Overview

Generate a complete pedagogical guide for a project+framework: a progressive series of lessons where each lesson introduces framework concepts just in time, with checkpoints, quizzes, and test categories.

## When to Use

- User asks "create a guide for {project} with {framework}"
- User asks "add a learning path for {project}"
- Scaffolding lessons, checkpoints, quizzes, or test categories
- Never: for writing standalone tutorials outside the learning-path pattern

## Input Contract

Two parameters:

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `project` | string | `"protask"` | Project folder name at repo root |
| `framework` | string | `"symfony"` | Framework name (must have a profile in the library) |

The skill discovers the project's PRD, OpenAPI spec, API server, client, and tester by convention (`{project}/docs/` and `{project}/api/`).

## Output Structure

```
{project}/guides/{framework}/
├── learning-path.js          ← ES module (export default { ... })
├── lessons/
│   ├── {NN}-{slug}.md        ← One Markdown lesson per module
│   └── ...
└── checkpoints/
    ├── {NN}-{slug}/          ← One directory per lesson
    │   ├── README.md
    │   └── ... (cumulative framework files)
    └── ...
```

## Step-by-Step

### 1. Read the project

Read these files in order:
1. `{project}/docs/PRD.md` — understand the domain, pages, features
2. `{project}/docs/openapi.json` — list all routes (6-19+)
3. `{project}/api/tester.js` — extract `describe()` category names
4. `{project}/api/client.js` — note method names for reference

### 2. Plan lessons

Split the project into vertical modules. Each lesson:
- Is a working increment (the learner sees result)
- Introduces 1-2 framework concepts
- Covers specific API routes

Map every OpenAPI route to at least one lesson.

### 3. Create the manifest

```js
export default {
  title: 'Construire {Project} avec {Framework}',
  framework: '{Framework} {version}',
  prerequisites: ['...', '...'],
  lessons: [
    {
      id: '01-{slug}',
      title: '{Human-readable title}',
      durationMinutes: 15,
      summary: '{One-sentence description}',
      file: '{project}/guides/{framework}/lessons/01-{slug}.md',
      files: ['file1', 'file2', ...],
      checkpoint: '{project}/guides/{framework}/checkpoints/01-{slug}/',
      testCategories: [],
      quiz: [],
    },
    // ...
  ],
}
```

### 4. Write lessons

Use EXACTLY these section headings:

```markdown
## Objectif

{Goal of the lesson, what the learner will achieve}

## Ce que tu vas obtenir

{Description of the outcome}

## Pourquoi maintenant ?

{Why this concept is needed at this point in the progression}

## Fais-le avec moi

{Step-by-step instructions with code blocks}

### {step number}. {Step title}

```bash
{command to run}
```

## Vérifie maintenant

{How to verify it works}

## Si cela échoue

{Troubleshooting common errors}

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `{project}/guides/{framework}/checkpoints/{id}/`

Fichiers créés : {list from manifest.files}
</details>
```

### 5. Create checkpoints

Each checkpoint directory must:
- Be at `checkpoints/{lesson-id}/`
- Contain all framework project files at the expected state AFTER this lesson
- Be **cumulative** — checkpoint N includes everything from lessons 1..N
- Include `README.md` listing the files and their roles
- Use real file content (not placeholders)

### 6. Define quizzes

Inline in the manifest, NOT in separate files. USE EXACTLY this schema:

```js
quiz: [
  {
    question: '{Question text}',
    options: ['Option A', 'Option B', 'Option C'],
    correct: 0, // index of correct answer
    explanation: '{Why this answer is correct}',
  },
]
```

**Field names MUST be `options` and `correct`**, not `choices`/`answers`/`answer`.

### 7. Map test categories

From `tester.js`, extract the `describe()` names. Each lesson selects which categories to run:

```js
// Lesson 01 (setup) — no tests yet
testCategories: [],

// Lesson 02 (auth) — test only auth
testCategories: ['Authentification'],

// Later lesson — test multiple categories
testCategories: ['Authentification', 'Todos'],
```

- `[]` = no tests for this lesson
- Only reference categories that exist in the project's `tester.js`
- Late lessons should test all relevant categories accumulated

## QuizItem Schema (exact)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | ✅ | The question text |
| `options` | string[] | ✅ | 3-4 answer choices |
| `correct` | number | ✅ | Index of the correct option (0-based) |
| `explanation` | string | ✅ | Explanation of the correct answer |

## Common Mistakes

- **choices/answer instead of options/correct** — the manifest field names MUST be `options` and `correct`
- **Empty checkpoints** — each checkpoint must have actual files
- **Non-cumulative checkpoints** — lesson N checkpoint must include all files from lessons 1..N
- **Missing routes** — every OpenAPI route must be covered by at least one lesson
- **Wrong heading format** — lessons must use the exact section headings listed above
- **Test categories don't exist** — verify each category name against `tester.js`
