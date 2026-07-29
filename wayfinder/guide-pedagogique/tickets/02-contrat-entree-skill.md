## Question

Définir précisément le contrat d'entrée du skill `write-guide-docs`. Que doit passer l'utilisateur ou l'agent pour que le skill produise un guide ?

### Questions à résoudre

1. **Paramètres obligatoires** — juste `projet` + `framework` ? Ou aussi `version`, `langue` ?
2. **Découverte du projet** — comment le skill trouve-t-il le PRD, l'OpenAPI spec, le serveur API, les data du projet ? Par convention de dossier ? Par paramètre explicite ?
3. **Configuration optionnelle** — peut-on passer des options (ex: `--skip-tests`, `--lang en`) ?
4. **État initial** — le skill part-il de zéro ou peut-il mettre à jour un guide existant ?
5. **Validation** — que faire si le projet n'existe pas ou si les fichiers attendus sont absents ?

### Dépendances

Ce ticket est bloqué par le ticket **Analyser le pattern learning-path existant** — il faut connaître la structure existante avant de décider ce que le skill doit recevoir.

Blocked by: 01-analyser-pattern-learning-path
