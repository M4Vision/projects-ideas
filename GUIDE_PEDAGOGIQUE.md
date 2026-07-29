# Guide pédagogique — Ajouter un parcours d'apprentissage à un projet

## Contexte

Un **guide pédagogique** est un parcours pas-à-pas qui fait construire un projet (ProTask, ShopFlow…) avec un framework (AdonisJS, Symfony, Next.js…). Chaque leçon explique une notion au moment où elle devient utile, vérifie que l'apprenant a bien suivi, et valide avec des tests.

Ce guide explique comment créer un nouveau parcours pour n'importe quel projet + framework du repo.

## Prérequis

- Le projet cible existe dans le repo avec sa structure standard (`docs/PRD.md`, `docs/openapi.json`, `api/server.js`, `api/client.js`, `api/tester.js`)
- Le repository a les conventions décrites dans `CONTEXT.md`
- Vous connaissez le framework cible (ses commandes, sa structure de dossier, son système d'authentification)

## Arborescence d'un guide

```
{projet}/guides/{framework}/
├── learning-path.js          ← Manifest du parcours (ES module)
├── lessons/
│   ├── 01-intro.md           ← Leçon 1
│   ├── 02-auth.md            ← Leçon 2
│   └── ...                   ← Autres leçons
└── checkpoints/
    ├── 01-intro/             ← Checkpoint de la leçon 1
    │   ├── README.md
    │   └── ... (fichiers du framework à ce stade)
    ├── 02-auth/
    │   ├── README.md
    │   └── ...
    └── ...
```

## Créer un guide pas à pas

### 1. Planifier les leçons

Découpez le projet en modules verticaux. Chaque leçon doit :

- Être un incrément fonctionnel (l'apprenant voit le résultat)
- Introduire 1-2 notions nouvelles du framework
- Produire des fichiers dans le projet framework

**Exemple ProTask + AdonisJS :**

| Leçon | Sujet | Notions | Routes couvertes |
|-------|-------|---------|------------------|
| 01 | Démarrer un projet | Installation, structure AdonisJS | — |
| 02 | Authentification | Auth guard, sessions | POST login, GET me |
| 03 | Routes et contrôleurs | Routing, controllers, validation | GET boards |
| 04 | Modèles et migrations | Lucid ORM, migrations, seeders | Toutes routes boards |
| 05 | Relation et colonnes | Relations HasMany, colonnes | Toutes routes columns |
| 06 | CRUD complet | CRUD complet AdonisJS | Toutes routes cards |
| 07 | Labels et relation N-N | Relations ManyToMany, pivot | Toutes routes labels |
| 08 | Commentaires imbriqués | Chargement eager, imbrication | Toutes routes comments |
| 09 | Invitations et permissions | ACL, politiques, autorisation | Toutes routes invitations |

### 2. Créer le manifest `learning-path.js`

```js
export default {
  title: 'Construire ProTask avec AdonisJS',
  framework: 'AdonisJS 6',
  prerequisites: [
    'Node.js v24+',
    'pnpm',
    'Bases de TypeScript',
    'Notions HTTP',
  ],
  lessons: [
    {
      id: '01-intro',
      title: 'Démarrer un projet AdonisJS',
      durationMinutes: 15,
      summary: 'Installer AdonisJS, créer le projet, découvrir la structure.',
      file: 'protask/guides/adonis/lessons/01-intro.md',
      files: ['package.json', 'tsconfig.json', '.env', 'start/routes.ts', 'ace.js', 'adonisrc.ts'],
      checkpoint: 'protask/guides/adonis/checkpoints/01-intro/',
      testCategories: [],
      quiz: [],
    },
    // ... autres leçons
  ],
}
```

**Champs obligatoires par leçon :**

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `string` | `{NN}-{kebab-slug}` — numéro à 2 chiffres + slug |
| `title` | `string` | Titre lisible (français) |
| `durationMinutes` | `number` | Temps estimé |
| `summary` | `string` | Phrase de description |
| `file` | `string` | Chemin relatif depuis la racine du repo |
| `files` | `string[]` | Fichiers créés/modifiés, relatifs au projet framework |
| `checkpoint` | `string` | Chemin vers le dossier checkpoint |
| `testCategories` | `string[]` | Catégories de tests à exécuter (vide = pas de tests) |
| `quiz` | `QuizItem[]` | Questions de quiz (peut être vide) |

### 3. Rédiger les leçons

Chaque leçon est un fichier Markdown dans `lessons/{lesson-id}.md`.

**Structure recommandée :**

```markdown
# {Titre de la leçon}

{durée estimée} minutes

## {Section 1}

{explication, instructions}

## {Section 2}

{suite du parcours}

### Commande à exécuter

```bash
{commande du framework}
```
```

**Conventions :**

- Frontmatter YAML optionnel (id, title, duration)
- Titres en `## ` pour les sections, `### ` pour les sous-sections
- Blocs de code avec langage spécifié (bash, typescript, etc.)
- Les instructions sont en français
- Les commandes sont précises et exécutables (copier-coller)
- Pas de commentaires inutiles dans les exemples de code

### 4. Créer les checkpoints

Chaque checkpoint est un dossier `checkpoints/{lesson-id}/` contenant :

- **Les fichiers du projet framework** à l'état attendu après la leçon (cumulatifs)
- **`README.md`** listant les fichiers et leur rôle

Les checkpoints servent à :
1. **L'apprenant** : comparer son code avec la solution
2. **Le player** : vérifier que chaque leçon est correcte avant de passer à la suivante

**Le contenu est cumulatif** : le checkpoint de la leçon N inclut tout ce qui a été fait dans les leçons 1..N.

### 5. Définir les quizzes

Les quizzes sont définis **inline dans le manifest** (`lesson.quiz: QuizItem[]`). Pas de fichier séparé.

```js
quiz: [
  {
    question: 'Quelle commande crée un nouveau projet AdonisJS ?',
    options: [
      'npm create adonisjs@latest',
      'adonis new project',
      'pnpm create adonisjs',
    ],
    correct: 0,
    explanation: 'adonisjs new est déprécié. pnpm create adonisjs fonctionne aussi.',
  },
]
```

**Structure d'un QuizItem :**

| Champ | Type | Description |
|-------|------|-------------|
| `question` | `string` | Question posée |
| `options` | `string[]` | 3-4 choix possibles |
| `correct` | `number` | Index de la bonne réponse |
| `explanation` | `string` | Explication du corrigé |

### 6. Configurer les tests

Le fichier `api/tester.js` du projet expose des catégories de tests via `describe()`.

Chaque leçon peut activer des catégories via `testCategories`. Le player exécute uniquement les tests des catégories demandées.

**Exemple :**

```js
// Dans learning-path.js
{
  id: '03-auth',
  testCategories: ['Authentification'], // seule la catégorie Auth est testée
}
```

**Règles :**

- `testCategories: []` = pas de tests pour cette leçon
- `testCategories: ['Authentification', 'Boards']` = exécute ces deux catégories
- Les tests sont déjà définis dans `tester.js` — le manifest choisit juste quels activer
- Toute catégorie utilisée doit exister dans `tester.js`

### 7. Valider

Après création du guide, lancez la validation :

1. **Parsage du manifest** : `node -e "import('./learning-path.js').then(m => console.log('OK', m.lessons.length, 'leçons'))"`
2. **Vérification des fichiers** : chaque `file` et `checkpoint` existe
3. **Exécution des tests** : lancer `node tester.js` avec une catégorie par leçon
4. **Jouabilité** : le player charge le manifest et affiche chaque leçon sans erreur

## Checklist de création

- [ ] Le projet a un PRD, une spec OpenAPI, un serveur API, un client et un tester
- [ ] Les leçons suivent une progression incrémentale
- [ ] Chaque leçon introduit 1-2 notions du framework
- [ ] Le manifest est un ES module (`export default`)
- [ ] Les IDs de leçons sont formatés `{NN}-{kebab-slug}`
- [ ] Tous les chemins de fichiers sont relatifs à la racine du repo
- [ ] Les checkpoints sont cumulatifs
- [ ] Les quizzes ont 3-4 options et une explication
- [ ] Chaque route OpenAPI du projet est couverte par au moins une leçon
- [ ] `testCategories` ne référence que des catégories existant dans `tester.js`

## Annexe : Convention des fichiers

| Fichier | Rôle |
|---------|------|
| `{projet}/guides/{framework}/learning-path.js` | Manifest du parcours |
| `{projet}/guides/{framework}/lessons/{id}.md` | Leçon markdown |
| `{projet}/guides/{framework}/checkpoints/{id}/` | Dossier checkpoint |
| `{projet}/guides/{framework}/checkpoints/{id}/README.md` | Description du checkpoint |

## Annexe : Exemple ProTask + AdonisJS

Le guide pilote se trouve dans `protask/guides/adonis/`. Il contient :

- **9 leçons** : de l'installation du framework aux permissions avancées
- **9 checkpoints** : 1 par leçon, avec l'état complet du projet à chaque étape
- **7 catégories de tests** : Authentification, Boards, Colonnes, Cartes, Labels, Commentaires, Invitations
- **~7 quizzes** : 1 par leçon avec vérification des notions clés
- **Toutes les 19 routes OpenAPI** couvertes à travers les leçons

C'est le modèle à suivre pour tout nouveau guide.
