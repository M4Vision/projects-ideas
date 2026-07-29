# TodoApp — Product Requirements Document

## Domaine

Application de gestion de tâches minimaliste. Un utilisateur peut s'authentifier et gérer sa liste de todos.

## Pages

1. **Login** — formulaire email + mot de passe
2. **Dashboard** — liste des todos avec statut (complété ou non)
3. **Todo detail** — voir, éditer, supprimer un todo

## Modèle de données

### User
- id (auto)
- name
- email
- password
- createdAt

### Todo
- id (auto)
- title
- completed (boolean)
- userId (propriétaire)
- createdAt

## Fonctionnalités

- Connexion par email/mot de passe (token Bearer)
- Liste des todos de l'utilisateur connecté
- Création d'un todo (title uniquement, completed = false par défaut)
- Modification d'un todo (title, completed)
- Suppression d'un todo
- Reset des données (route interne, pas exposée)

## Routes API

| Méthode | Path | Description |
|---------|------|-------------|
| POST | /api/auth/login | Authentification |
| GET | /api/auth/me | Profil utilisateur courant |
| GET | /api/todos | Liste des todos |
| POST | /api/todos | Création d'un todo |
| PUT | /api/todos/:id | Modification d'un todo |
| DELETE | /api/todos/:id | Suppression d'un todo |
| POST | /api/_reset | Reset données (interne) |
