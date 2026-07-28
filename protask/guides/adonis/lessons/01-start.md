## Objectif

Installer AdonisJS 6, créer un nouveau projet et comprendre la structure des dossiers.

## Ce que tu vas obtenir

Un projet AdonisJS opérationnel avec SQLite qui répond sur `http://localhost:3333`.

## Pourquoi maintenant ?

Avant d'écrire la moindre route, il faut connaître l'outil et son environnement. Cette leçon pose les fondations : chaque dossier a un rôle, chaque fichier de configuration a un but.

## Fais-le avec moi

### 1. Créer le projet

```bash
mkdir -p protask-adonis && cd protask-adonis
pnpm init
```

Ajoute `"type": "module"` dans `package.json`. Installe les dépendances principales :

```bash
pnpm add @adonisjs/core@^6.0.0 @adonisjs/lucid@^21.0.0 @adonisjs/bodyparser@^11.0.4 better-sqlite3@^13.0.1
pnpm add -D tsx typescript @types/node @types/better-sqlite3
```

### 2. Fichiers de configuration

Crée `tsconfig.json`, `adonisrc.js`, `env.ts` et les fichiers dans `config/`. AdonisJS a besoin de :

- `config/app.ts` — configuration générale de l'application
- `config/database.ts` — connexion SQLite via Lucid
- `config/bodyparser.ts` — parsing du corps des requêtes
- `config/cors.ts` — partage des ressources entre origines

### 3. Lancer le serveur

```bash
node bin/server.ts
```

Tu devrais voir : `Server started on http://localhost:3333`.

## Vérifie maintenant

Ouvre `http://localhost:3333` dans ton navigateur. Tu devrais voir une page 404 — c'est normal, il n'y a encore aucune route.

Arrête le serveur avec `Ctrl+C`.

## Si cela échoue

- **Port déjà utilisé** : change `PORT` dans `.env`.
- **Erreur "Cannot find module"** : vérifie que `pnpm install` a bien créé `node_modules/`.
- **Erreur TypeScript** : vérifie `tsconfig.json` et que `"type": "module"` est dans `package.json`.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/01-start/`

Fichiers créés : `package.json`, `tsconfig.json`, `adonisrc.js`, `env.ts`, `.env`, `config/app.ts`, `config/database.ts`, `config/bodyparser.ts`, `config/cors.ts`, `start/kernel.ts`, `bin/server.ts`

</details>
