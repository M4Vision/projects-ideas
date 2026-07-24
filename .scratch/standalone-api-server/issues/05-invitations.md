# 05 — Invitations

**What to build:** Routes invitations (invite, get, accept, decline, cancel, removeMember) ajoutées au serveur. Méthodes `inviteMember()`, `getInvitations()`, `acceptInvitation()`, `respondToInvitation()`, `cancelInvitation()`, `removeMember()` dans le client. Tests e2e.

**Blocked by:** 02 — Boards & Colonnes

**Status:** completed

- [x] `POST /api/boards/:id/invitations` invite un membre (validation email, utilisateur existe, pas déjà membre, pas déjà invité)
- [x] `GET /api/boards/:id/invitations` liste les invitations d'un board
- [x] `PATCH /api/invitations/:id` accepte ou decline une invitation (vérifie que l'utilisateur a le droit de répondre)
- [x] `DELETE /api/invitations/:id` annule une invitation (owner only, pending only)
- [x] `DELETE /api/boards/:id/members/:userId` retire un membre (owner only, pas soi-même)
- [x] Client expose les 6 méthodes
- [x] Tests e2e : inviter/accepter/refuser/annuler, déjà invité, déjà membre, email invalide, utilisateur inexistant, wrong user ne peut pas répondre, retirer membre
