---
parent: ../guide-pedagogique-protask.md
labels:
  - wayfinder:grilling
status: closed
assignee: codex
---

# Vérification et diagnostic par leçon

## Question

Quel niveau de test observable, de résultat attendu et de dépannage doit conclure chaque leçon pour rassurer un débutant sans alourdir le parcours ?

## Blocking

- [Prototype du parcours AdonisJS débutant](./002-prototype-parcours-adonis-debutant.md)

## Resolution comment

Chaque bloc de leçons propose « Vérifier mon étape » : il réemploie le testeur existant et son champ **API Base URL**, mais n'exécute que les catégories API déjà construites (authentification, puis boards, etc.). Le résultat affiche les réussites, la valeur attendue, la valeur reçue et une piste de diagnostic adaptée.

Un mini-quiz non bloquant conclut aussi le bloc : deux questions de compréhension et une mise en situation pratique. Chaque réponse reçoit immédiatement son explication ; il n'y a ni note, ni échec, ni condition de progression.
