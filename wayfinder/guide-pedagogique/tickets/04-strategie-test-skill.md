## Question

Définir comment le skill `write-guide-docs` est testé. Le skill doit suivre la convention writing-skills (TDD : RED-GREEN-REFACTOR). Comment s'assurer qu'il produit un guide correct et complet ?

### Questions à résoudre

1. **Tests du skill lui-même** — quels pressure scenarios ? Que teste-t-on exactement ?
2. **Tests du guide produit** — comment vérifier qu'un guide généré est valide (manifest parsable, leçons existent, checkpoints complets) ?
3. **Tests e2e du guide** — peut-on lancer les tests e2e du guide généré pour vérifier que tout marche ? Faut-il un serveur API de test ?
4. **Coverage API** — comment garantir que toutes les routes OpenAPI sont couvertes par les leçons ?
5. **Self-testing** — le skill doit-il inclure un mécanisme pour se tester lui-même après exécution ?
6. **Critères d'acceptation** — qu'est-ce qui constitue un "guide réussi" ?

### Dépendances

Bloqué par le contrat de sortie (ticket **Définir le contrat de sortie du skill**) — on ne peut pas tester ce qu'on n'a pas défini.

Blocked by: 03-contrat-sortie-skill
