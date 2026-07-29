# Décision #2 : Contrat d'entrée du skill write-guide-docs

## Date
2026-07-29

## Décisions

| Sujet | Décision |
|-------|----------|
| Paramètres obligatoires | `projet` (nom du dossier) + `framework` (nom du profil) |
| Résolution du projet | Par convention : `projet="protask"` → `protask/` à la racine du repo. Si absent, griller. |
| Langue du guide | Déduite du PRD. Optionnellement `--lang` pour forcer. |
| Profils framework | Librairie intégrée (AdonisJS 6, Symfony 7, Next.js 15…). Si inconnu, griller l'utilisateur. |
| Flags v1 | Aucun. Le skill produit tout (leçons, checkpoints, quizzes, tests, manifest). |
| Guide existant | Abort — erreur "guide déjà existant". L'utilisateur supprime manuellement s'il veut régénérer. |

## Bloqueurs débloqués
- #3 (contrat de sortie) — devrait être grillé maintenant
- #6 (format doc humaine) — toujours bloqué par #3
