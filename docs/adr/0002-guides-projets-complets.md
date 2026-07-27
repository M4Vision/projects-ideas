# Guides = projets complets exécutables

Chaque guide d'implémentation (`protask/guides/{framework}/`) contient non seulement un `index.md` explicatif, mais aussi le code source complet et exécutable du projet dans ce framework. Pas uniquement des extraits à copier-coller.

**Status**: accepted

**Alternatives considérées** :
- **Markdown uniquement** : extraits de code dans le texte, pas de projet exécutable. Moins de maintenance, mais le lecteur ne peut pas lancer le code, et rien ne garantit que les extraits fonctionnent.
- **Extraits exécutables isolés** : fichiers de code individuels qu'on peut copier sans projet complet. Pas de validation cross-fichier, pas de test possible.

**Conséquences** : chaque guide est un vrai projet avec ses propres dépendances, config, et point d'entrée. La batterie de tests API (`e2e.spec.js`, pilotée par `API_BASE_URL`) peut tourner contre n'importe quel guide pour le valider. Coût de maintenance plus élevé (mises à jour de dépendances, multi-runtimes en CI), mais le gain pédagogique et la testabilité justifient l'investissement.

Le fichier `server.js` (mock API Hono) reste la référence mono-fichier — les guides sont des réimplémentations pédagogiques.
