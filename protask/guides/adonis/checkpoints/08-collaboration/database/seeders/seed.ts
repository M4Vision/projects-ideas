import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '../../app/models/User.js'
import Board from '../../app/models/Board.js'
import ProjectColumn from '../../app/models/ProjectColumn.js'
import Card from '../../app/models/Card.js'
import Label from '../../app/models/Label.js'
import Comment from '../../app/models/Comment.js'
import Invitation from '../../app/models/Invitation.js'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      { id: 1, name: 'Alexandre', email: 'alex@protask.dev', password: 'pass123', avatar: '' },
      { id: 2, name: 'Sophie', email: 'sophie@protask.dev', password: 'pass123', avatar: '' },
      { id: 3, name: 'Marc', email: 'marc@protask.dev', password: 'pass123', avatar: '' },
    ])

    await Board.createMany([
      { id: 1, title: 'Design System', ownerId: 1, description: 'Composants et design tokens', color: '#1976D2', categories: ['Design', 'UI/UX'], memberIds: [2, 3] },
      { id: 2, title: 'Refonte Mobile', ownerId: 2, description: 'Application mobile', color: '#388E3C', categories: ['Mobile'], memberIds: [1] },
      { id: 3, title: 'Marketing Q2', ownerId: 3, description: 'Campagne marketing Q2', color: '#F57C00', categories: ['Marketing'], memberIds: [1, 2] },
    ])

    await ProjectColumn.createMany([
      { id: 1, title: 'Backlog', orderColumn: 0, boardId: 1 },
      { id: 2, title: 'En cours', orderColumn: 1, boardId: 1 },
      { id: 3, title: 'Terminé', orderColumn: 2, boardId: 1 },
      { id: 4, title: 'Backlog', orderColumn: 0, boardId: 2 },
      { id: 5, title: 'En cours', orderColumn: 1, boardId: 2 },
      { id: 6, title: 'Terminé', orderColumn: 2, boardId: 2 },
      { id: 7, title: 'Idées', orderColumn: 0, boardId: 3 },
      { id: 8, title: 'En production', orderColumn: 1, boardId: 3 },
    ])

    await Label.createMany([
      { id: 1, name: 'Design', color: '#9C27B0', description: 'Tâches de conception', boardId: 1 },
      { id: 2, name: 'Dev', color: '#2196F3', description: 'Tâches de développement', boardId: 1 },
      { id: 3, name: 'Documentation', color: '#4CAF50', description: 'Tâches de documentation', boardId: 1 },
      { id: 4, name: 'Urgent', color: '#F44336', description: 'Tâches urgentes', boardId: 1 },
    ])

    await Card.createMany([
      { id: 1, title: 'Définir la palette', description: 'Choisir les couleurs primaires et secondaires.', orderColumn: 0, columnId: 1, dueDate: '2025-04-15', assigneeId: 1, labelIds: [1] },
      { id: 2, title: 'Composants UI', description: 'Créer les composants Button, Input, Card, Modal.', orderColumn: 1, columnId: 1, dueDate: '2025-04-20', assigneeId: 2, labelIds: [1, 2] },
      { id: 3, title: 'Page accueil responsive', description: 'Terminer la mise en page responsive.', orderColumn: 0, columnId: 2, dueDate: '2025-04-10', assigneeId: 1, labelIds: [2] },
      { id: 4, title: 'Documentation', description: 'Écrire la documentation du design system.', orderColumn: 1, columnId: 3, dueDate: '2025-04-05', assigneeId: 2, labelIds: [3] },
      { id: 5, title: 'Wireframes', description: 'Wireframes validés par le client.', orderColumn: 0, columnId: 4, dueDate: '2025-04-08', assigneeId: 1, labelIds: [2] },
      { id: 6, title: 'Maquette Figma', description: 'Maquette haute fidélité.', orderColumn: 0, columnId: 5, dueDate: '2025-04-18', assigneeId: 1, labelIds: [1] },
      { id: 7, title: 'Tests utilisateurs', description: 'Sessions de tests utilisateurs.', orderColumn: 0, columnId: 6, dueDate: '2025-04-12', assigneeId: 2, labelIds: [3] },
      { id: 8, title: 'Analyse concurrents', description: 'Analyse des concurrents directs.', orderColumn: 0, columnId: 7, dueDate: '2025-04-14', assigneeId: 1, labelIds: [2] },
      { id: 9, title: 'Stratégie contenu', description: 'Plan de contenu pour les réseaux sociaux.', orderColumn: 1, columnId: 7, dueDate: '2025-04-22', assigneeId: 2, labelIds: [1, 4] },
      { id: 10, title: 'Campagne emailing', description: 'Campagne emailing Q2.', orderColumn: 0, columnId: 8, dueDate: '2025-04-25', assigneeId: 1, labelIds: [4] },
    ])

    await Comment.createMany([
      { id: 1, text: 'J\'ai préparé quelques propositions.', authorId: 2, cardId: 1 },
      { id: 2, text: 'Je valide la palette.', authorId: 1, cardId: 1 },
      { id: 3, text: 'On peut déployer ce week-end ?', authorId: 2, cardId: 2 },
      { id: 4, text: 'OK pour moi.', authorId: 1, cardId: 2 },
      { id: 5, text: 'J\'ai mis à jour les wireframes.', authorId: 1, cardId: 5 },
    ])

    await Invitation.createMany([
      { id: 1, boardId: 1, userId: 3, status: 'accepted' },
      { id: 2, boardId: 1, userId: 1, status: 'pending' },
    ])
  }
}
