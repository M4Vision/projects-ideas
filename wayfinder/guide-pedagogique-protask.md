---
labels:
  - wayfinder:map
status: closed
---

# Parcours pédagogique débutant pour les guides ProTask

## Destination

Une structure pédagogique commune, validée sur le guide AdonisJS de ProTask, qui permet à une personne connaissant les bases du web mais débutante avec le framework de construire une API complète, de comprendre chaque étape et de s'orienter facilement dans le code.

## Notes

- Employer la notion de « Guide pédagogique » définie dans `CONTEXT.md`.
- Consulter les compétences `/grilling`, `/domain-modeling` et `/prototype` selon le type du ticket.
- Les guides doivent contenir des prérequis explicites, des leçons courtes et numérotées, une navigation d'ensemble, des extraits progressifs, une explication du besoin et du pourquoi, une vérification et une aide au diagnostic à chaque étape.
- Le code complet ou un lien vers son état correspondant apparaît à la fin de chaque leçon.
- Les extraits expliqués précèdent toujours une solution complète repliée par défaut, liée à un dossier d'état de l'étape.
- Chaque bloc se vérifie dans le testeur existant, par **API Base URL** et catégories progressivement disponibles, puis se conclut par un quiz explicatif sans note.
- L'expérience visuelle des guides réemploie le design system principal ; elle ne crée pas de thème de couleurs parallèle.

## Decisions so far

<!-- Les décisions résolues seront indexées ici. -->

- [Prototype du parcours AdonisJS débutant](./tickets/002-prototype-parcours-adonis-debutant.md) — Le modèle « Atelier & fichiers » est retenu : le besoin guide la leçon et les fichiers concernés restent visibles.
- [Inventaire du design system principal pour les guides](./tickets/006-inventaire-design-system-principal.md) — `index.html` fournit les tokens, les surfaces et les états de navigation à réemployer.
- [Stratégie des états complets du code](./tickets/003-strategie-etats-code-guide.md) — Les extraits expliqués priment ; la solution complète repliée et le dossier d'état servent de filet de sécurité.
- [Vérification et diagnostic par leçon](./tickets/004-verification-et-diagnostic-par-lecon.md) — Tests partiels sur la même API Base URL et quiz de compréhension non bloquants renforcent l'apprentissage.
- [Critères de validation du pilote AdonisJS](./tickets/005-criteres-pilote-adonis.md) — Le guide doit permettre de démarrer, construire, expliquer et modifier une fonctionnalité en autonomie.

## Not yet specified

<!-- La carte est complète : les prochains détails relèvent de l'exécution. -->

## Out of scope

- Réécrire immédiatement les guides Laravel, NestJS et Symfony.
- Modifier l'API ProTask ou les projets d'exemple pendant cette démarche de conception.
- Écrire les leçons et les états de code détaillés du pilote AdonisJS : c'est l'exécution de la démarche, pas une décision restante.
- Décliner le pilote vers Laravel, NestJS et Symfony : cette décision se prendra après retour sur le pilote.
