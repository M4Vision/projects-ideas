## Question

Rechercher comment un skill peut découvrir la structure d'un projet (routes API, PRD, modèles, data) sans intervention humaine. Quels fichiers existent dans chaque projet ProTask/ShopFlow ? Quelle est la convention ?

### Ce qu'il faut analyser

1. **Convention de dossiers projet** — `protask/`, `shopflow/` — quels fichiers sont constants ?
2. **PRD** — où se trouve-t-il ? Format ? Structure des sections ?
3. **OpenAPI spec** — où est `openapi.json` ? Comment parser les routes ?
4. **API server** — où est `server.js` ? Comment extraire les routes ?
5. **Client API** — où est `client.js` ? Quelles méthodes expose-t-il ?
6. **Data / modèles** — où est définie la structure des données (utilisateurs, boards, cartes…) ?
7. **Tester.js** — où est `tester.js` ? Comment sont structurées les catégories de tests ?
8. **Différences entre projets** — ProTask a 19 routes, ShopFlow peut en avoir combien ? Même pattern ?

### Livrable

Documenter les conventions d'arborescence et de format pour qu'un skill puisse naviguer n'importe quel projet du repo.

Blocked by: none
