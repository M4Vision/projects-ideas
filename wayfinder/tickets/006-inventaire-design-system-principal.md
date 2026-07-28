---
parent: ../guide-pedagogique-protask.md
labels:
  - wayfinder:task
status: closed
assignee: codex
---

# Inventaire du design system principal pour les guides

## Question

Quels tokens de couleur, typographies, espacements et composants du design system principal doivent être réemployés pour que l'expérience de lecture des guides soit cohérente avec le reste du produit ?

## Resolution comment

`index.html` est la source canonique. Les guides réemploieront ses tokens : fond `#0A0A0A`, premier plan `#EDEDED`, surface `#141414`, surface au survol `#1A1A1A`, bordure `#232323`, texte secondaire `#888`, accent bleu `#3B82F6` (survol `#2563EB`), rayon `8px` et ombre de contour `0 0 0 1px var(--border)`. Ils utiliseront `system-ui, -apple-system, sans-serif`, les panneaux et la navigation sombre à bordures fines, ainsi que les états actifs bleus existants.

Les couleurs de succès et d'erreur restent réservées aux résultats de vérification ; elles ne deviennent pas des accents décoratifs.
