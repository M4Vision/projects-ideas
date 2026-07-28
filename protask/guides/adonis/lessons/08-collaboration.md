## Objectif

Ajouter les labels, les commentaires et le système d'invitation entre utilisateurs.

## Ce que tu vas obtenir

- Labels : CRUD attaché à un board, application aux cartes
- Commentaires : ajout et suppression sur une carte
- Invitations : inviter un utilisateur, accepter/refuser, retirer un membre

## Pourquoi maintenant ?

Un Kanban solo est utile, mais la collaboration est ce qui rend ProTask puissant. Labels, commentaires et invitations permettent à une équipe de travailler ensemble.

## Fais-le avec moi

### 1. LabelsController

Les labels appartiennent à un board. Chaque label a un nom, une couleur et une description optionnelle.

```typescript
// Créer un label sur un board
router.post('/api/boards/:boardId/labels', [LabelsController, 'store'])

// Lister les labels d'un board
router.get('/api/boards/:boardId/labels', [LabelsController, 'index'])

// Modifier/supprimer
router.patch('/api/labels/:id', [LabelsController, 'update'])
router.delete('/api/labels/:id', [LabelsController, 'destroy'])
```

### 2. CommentsController

Les commentaires appartiennent à une carte. Chaque commentaire a un texte, un auteur et une date.

```typescript
// Ajouter un commentaire
router.post('/api/cards/:cardId/comments', [CommentsController, 'store'])

// Lister les commentaires d'une carte
router.get('/api/cards/:cardId/comments', [CommentsController, 'index'])

// Supprimer
router.delete('/api/comments/:id', [CommentsController, 'destroy'])
```

### 3. InvitationsController

Le système d'invitation permet d'inviter un utilisateur existant à rejoindre un board.

```typescript
// Inviter
router.post('/api/boards/:boardId/invitations', [InvitationsController, 'store'])

// Lister les invitations
router.get('/api/boards/:boardId/invitations', [InvitationsController, 'index'])

// Accepter/refuser
router.patch('/api/invitations/:id', [InvitationsController, 'update'])

// Annuler
router.delete('/api/invitations/:id', [InvitationsController, 'destroy'])

// Retirer un membre
router.delete('/api/boards/:boardId/members/:memberId', [InvitationsController, 'removeMember'])
```

### 4. Logique d'invitation

L'invitation a trois statuts : `pending`, `accepted`, `declined`. Quand elle est acceptée, l'userId est ajouté au tableau `memberIds` du board.

```typescript
async update({ params, request, response }: HttpContext) {
  const invitation = await Invitation.find(params.id)
  const { status } = request.body()
  if (status === 'accepted') {
    const board = await invitation.related('board').query().first()
    // Ajouter l'utilisateur aux membres
  }
  invitation.status = status
  await invitation.save()
}
```

## Vérifie maintenant

```bash
# Créer un label
curl -X POST http://localhost:3333/api/boards/1/labels \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bug","color":"#FF0000"}'

# Commenter une carte
curl -X POST http://localhost:3333/api/cards/1/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Je travaille dessus"}'

# Inviter Sophie
curl -X POST http://localhost:3333/api/boards/1/invitations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"sophie@protask.dev"}'
```

## Si cela échoue

- **Erreur "Email invalide"** : vérifie le format de l'email.
- **Erreur "Utilisateur introuvable"** : l'utilisateur invité doit exister dans la base.
- **Erreur 403** : seul le propriétaire du board peut inviter ou retirer des membres.

<details>
<summary>Code complet</summary>

Voir le dossier d'état : `protask/guides/adonis/checkpoints/08-collaboration/`

Fichiers créés : `app/models/Label.ts`, `app/models/Comment.ts`, `app/models/Invitation.ts`, `app/controllers/LabelsController.ts`, `app/controllers/CommentsController.ts`, `app/controllers/InvitationsController.ts`

Fichiers modifiés : `start/routes.ts`, `database/migrations/`

</details>
