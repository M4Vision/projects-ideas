# Rapport Baseline — write-guide-docs

## Ce qui a fonctionné ✅

- Structure du manifest (ES module, champs) conforme
- IDs format `{NN}-{kebab-slug}` corrects
- `testCategories` vides pour leçon 01, puis activées
- Checkpoints cumulatifs (02 inclus 01 + nouveaux fichiers)
- Leçons avec sections correctes (Objectif, Ce que tu vas obtenir, etc.)
- Quizzes inline dans le manifest

## Déviation ❌

- **Quiz format** : utilise `choices` (array) + `answer` (index) au lieu de `options` + `correct`
  - Manifest généré : `{ question, choices: [...], answer: 1, explanation }`
  - Convention réelle : `{ question, options: [...], correct: 0, explanation }`

## Cause probable

L'agent a regardé le manifest AdonisJS pour le format mais n'a pas vérifié les noms de champs exacts du quiz. Il a utilisé des noms "naturels" (choices, answer) qui lui semblaient cohérents.
