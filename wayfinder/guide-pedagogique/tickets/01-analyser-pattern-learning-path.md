## Question

Extraire les conventions, fichiers, structure et tests du pilote AdonisJS pour documenter le pattern learning-path. L'agent doit analyser le code existant et produire un inventaire structuré de tout ce qu'un skill doit savoir pour reproduire le pattern sur un nouveau projet+framework.

### Ce qu'il faut inventorier

1. **Structure du manifest** (`learning-path.js`) — schéma exact, champs obligatoires, formats
2. **Structure des leçons** — format Markdown, conventions, en-têtes, sections attendues
3. **Structure des checkpoints** — organisation des dossiers, fichiers inclus, README
4. **Format des quizzes** — structure de l'objet quiz, types de questions
5. **Système de catégories de tests** — comment `testCategories` mappe aux `describe()` blocks dans `tester.js`
6. **Structure des fichiers du viewer** — comment `renderLesson`, `renderQuiz`, `_runLessonChecks` consomment le manifest
7. **Conventions de nommage** — dossiers, fichiers, IDs

### Livrable

Un fichier `docs/learning-path-pattern.md` qui contient l'inventaire complet — utilisable comme source de vérité pour construire le skill ET la doc humaine.

Blocking: none
Blocked by: none
