# 05 — Invitations

**What to build:** Routes invitations (invite, get, accept, decline, cancel, removeMember) ajoutées au serveur. Méthodes `inviteMember()`, `getInvitations()`, `acceptInvitation()`, `respondToInvitation()`, `cancelInvitation()`, `removeMember()` dans le client. Tests e2e.

**Blocked by:** 02 — Boards & Colonnes

**Status:** ready-for-agent

- [ ] `POST /api/boards/:id/invitations` invite un membre (validation email, utilisateur existe, pas déjà membre, pas déjà invité)
- [ ] `GET /api/boards/:id/invitations` liste les invitations d'un board
- [ ] `PATCH /api/invitations/:id` accepte ou decline une invitation (vérifie que l'utilisateur a le droit de répondre)
- [ ] `DELETE /api/invitations/:id` annule une invitation (owner only, pending only)
- [ ] `DELETE /api/boards/:id/members/:userId` retire un membre (owner only, pas soi-même)
- [ ] Client expose les 6 méthodes
- [ ] Tests e2e : inviter/accepter/refuser/annuler, déjà invité, déjà membre, email invalide, utilisateur inexistant, wrong user ne peut pas répondre, retirer membre
