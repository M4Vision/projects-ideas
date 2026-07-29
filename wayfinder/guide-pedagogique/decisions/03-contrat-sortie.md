# Décision #3 : Contrat de sortie du skill write-guide-docs

## Date
2026-07-29

## Décisions

| Sujet | Décision |
|-------|----------|
| Fichiers générés | Manifest + leçons + checkpoints + quizzes (inline) + tester.js (catégories) |
| Emplacement | `{projet}/guides/{framework}/` |
| Format manifest | ES Module (`export default { ... }`) |
| Format leçons | Markdown, frontmatter YAML léger, sections `## `, pas de template rigide |
| Format checkpoints | Dossier par leçon, fichiers cumulatifs, README.md |
| Format quizzes | Inline dans le manifest (`lesson.quiz: QuizItem[]`) |
| Tests générés | `testCategories` dans manifest + mise à jour/création de `tester.js` |
| Pas de tests e2e | Les tests e2e Playwright appartiennent aux templates, pas aux guides |

## Bloqueurs débloqués
- #4 (stratégie de test du skill) — peut commencer
- #6 (format guide pédagogique) — peut commencer
