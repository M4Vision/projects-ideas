## Objectif

Bilan du guide, exécuter la suite complète de tests, et réaliser une petite modification autonome.

## Ce que tu vas obtenir

La satisfaction d'avoir construit une API complète avec AdonisJS, et la capacité d'y ajouter une fonctionnalité seul.

## Pourquoi maintenant ?

La meilleure façon d'apprendre est de modifier ce qu'on a construit. Cette leçon te guide pour exécuter tous les tests et faire un changement qui touche plusieurs fichiers.

## Fais-le avec moi

### 1. Lancer le seed

Avant les tests, charge les données de démonstration :

```bash
node bin/console.ts db:seed
```

### 2. Exécuter la batterie de tests

Depuis la racine du repo projets-ideas :

```bash
API_BASE_URL=http://localhost:3333/api pnpm test:api
```

Tu devrais voir les 53 tests passer. Si certains échouent, la leçon correspondante t'aide à diagnostiquer le problème.

### 3. Modifier une fonctionnalité

Essaie d'ajouter un champ `priority` (high, medium, low) à la carte. Voici les fichiers à modifier :

1. **Migration** — ajoute la colonne `priority` dans une nouvelle migration
2. **Modèle Card** — ajoute la propriété `priority`
3. **Contrôleur CardsController** — inclue `priority` dans la création et la mise à jour
4. **Tests** — vérifie que la priorité est bien renvoyée

```bash
# Exemple : créer une carte avec priorité
curl -X POST http://localhost:3333/api/columns/1/cards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Urgent","priority":"high"}'
```

## Vérifie maintenant

```bash
API_BASE_URL=http://localhost:3333/api pnpm test:api
```

Tous les tests doivent passer. Si tu as ajouté `priority`, ils passent toujours — les tests existants ne testent pas ce nouveau champ, ce qui est normal pour une extension.

## Si cela échoue

- **Tests qui échouent** : relis la leçon concernée et vérifie chaque fichier avec le code complet.
- **Migration qui ne s'applique pas** : exécute `node bin/console.ts migration:run` pour les migrations en attente.
- **Tu es bloqué** : compare avec le dossier d'état complet (checkpoint 09) pour voir la différence.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/09-next-steps/`

Le projet complet est disponible. Tu peux aussi le comparer avec ta version pour voir les écarts.

</details>

## Félicitations ! 🎉

Tu as construit l'API ProTask complète avec AdonisJS 6. Tu sais maintenant :

- Créer un projet AdonisJS et naviguer dans sa structure
- Définir des routes et des contrôleurs
- Utiliser Lucid ORM pour les migrations et les modèles
- Protéger des routes avec un middleware
- Implémenter un CRUD complet avec relations
- Gérer l'authentification simulée par token
- Exécuter la suite de tests pour valider ton travail

La prochaine étape ? Essaye un autre framework (NestJS, Laravel, Symfony) pour comparer les approches, ou plonge dans le template neo-brutalist pour voir comment l'API est consommée côté frontend.
