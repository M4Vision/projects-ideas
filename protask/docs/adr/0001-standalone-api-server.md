# Standalone API server (Hono) per project

Chaque projet du repo (ProTask, ShopFlow, etc.) avait son `demo-api.js` — fichier JS centralisé avec toutes les méthodes async, les tests intégrés, et des données en mémoire. Pas de serveur possible, tests client-side uniquement.

On remplace ce pattern par un serveur Hono autonome par projet : `protask/api/server.js`, `shopflow/api/server.js`, etc. Chaque projet a aussi son client fetch (`client.js`) et ses tests Vitest (`e2e.spec.js`) qui tournent contre n'importe quelle implémentation du contrat OpenAPI.

**Status**: accepted

**Conséquences** : les templates gardent les mêmes noms de méthode (wrapper client). `vite.config.js` doit pouvoir lancer/proxyfier plusieurs serveurs selon le projet actif. Chaque projet a son propre serveur isolé, ses données en mémoire, et ses tests indépendants.
