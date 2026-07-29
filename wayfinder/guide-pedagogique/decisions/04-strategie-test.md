# Décision #4 : Stratégie de test du skill write-guide-docs

## Date
2026-07-29

## Décisions

| Sujet | Décision |
|-------|----------|
| Niveaux de test | Validation sortie (fichiers + parse) → Test du guide généré (tester.js) → Grilling subagent |
| Projet de test | `test/fixtures/test-project/` — vrai PRD, serveur Hono (2-3 routes), client, tester |
| Critères d'acceptation | 1) Guide complet produit pour protask+adonis 2) Tests de validation passent 3) Subagent grilling ne trouve pas de bugs |
