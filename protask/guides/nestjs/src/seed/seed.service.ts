import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Board } from '../entities/board.entity';
import { ProjectColumn } from '../entities/column.entity';
import { Card } from '../entities/card.entity';
import { Label } from '../entities/label.entity';
import { Comment } from '../entities/comment.entity';
import { Invitation } from '../entities/invitation.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Board) private boards: Repository<Board>,
    @InjectRepository(ProjectColumn) private columns: Repository<ProjectColumn>,
    @InjectRepository(Card) private cards: Repository<Card>,
    @InjectRepository(Label) private labels: Repository<Label>,
    @InjectRepository(Comment) private comments: Repository<Comment>,
    @InjectRepository(Invitation) private invitations: Repository<Invitation>,
  ) {}

  async seed(): Promise<void> {
    const existing = await this.users.findOne({ where: { id: 1 } });
    if (existing) return;

    // Users
    const alex = await this.users.save({ id: 1, name: 'Alexandre', email: 'alex@protask.dev', password: 'pass123', avatar: '' });
    const sophie = await this.users.save({ id: 2, name: 'Sophie', email: 'sophie@protask.dev', password: 'pass123', avatar: '' });
    const marc = await this.users.save({ id: 3, name: 'Marc', email: 'marc@protask.dev', password: 'pass123', avatar: '' });

    // Board 1
    const board1 = await this.boards.save({ id: 1, title: 'Design System', ownerId: 1, description: "Design system de l'application", color: '#8B5CF6', categories: ['Design', 'UI/UX'], memberIds: [2, 3] });
    const b1c1 = await this.columns.save({ id: 1, title: 'Backlog', orderColumn: 0, boardId: 1, color: '#6B7280', description: 'Tâches en attente de traitement' });
    const b1c2 = await this.columns.save({ id: 2, title: 'En cours', orderColumn: 1, boardId: 1, color: '#3B82F6', description: 'Tâches en cours de développement' });
    const b1c3 = await this.columns.save({ id: 3, title: 'Terminé', orderColumn: 2, boardId: 1, color: '#10B981', description: 'Tâches terminées et validées' });

    // Board 2
    const board2 = await this.boards.save({ id: 2, title: 'Refonte App Mobile', ownerId: 1, description: "Refonte complète de l'application mobile", color: '#3B82F6', categories: ['Mobile'], memberIds: [] });
    const b2c1 = await this.columns.save({ id: 4, title: 'À faire', orderColumn: 0, boardId: 2, color: '#F59E0B', description: 'Tâches planifiées' });
    const b2c2 = await this.columns.save({ id: 5, title: 'En cours', orderColumn: 1, boardId: 2, color: '#3B82F6', description: '' });
    const b2c3 = await this.columns.save({ id: 6, title: 'Terminé', orderColumn: 2, boardId: 2, color: '#10B981', description: '' });

    // Board 3
    const board3 = await this.boards.save({ id: 3, title: 'Marketing Q2', ownerId: 2, description: 'Stratégie marketing pour le Q2', color: '#EF4444', categories: ['Marketing'], memberIds: [3] });
    await this.columns.save({ id: 7, title: 'Idées', orderColumn: 0, boardId: 3, color: '#8B5CF6', description: 'Idées à explorer' });
    await this.columns.save({ id: 8, title: 'En production', orderColumn: 1, boardId: 3, color: '#EF4444', description: 'Campagnes en cours' });

    // Labels
    await this.labels.save({ id: 1, name: 'Design', color: '#8B5CF6', boardId: 1, description: 'Design' });
    await this.labels.save({ id: 2, name: 'Dev', color: '#3B82F6', boardId: 1, description: 'Dev' });
    await this.labels.save({ id: 3, name: 'Documentation', color: '#10B981', boardId: 1, description: 'Doc' });
    await this.labels.save({ id: 4, name: 'Urgent', color: '#EF4444', boardId: 1, description: 'Urgent' });

    // Cards
    await this.cards.save({ id: 1, title: 'Définir la palette', description: 'Choisir les couleurs primaires et secondaires.', orderColumn: 0, columnId: 1, dueDate: '2025-04-15', assigneeId: 1, labelIds: [1] });
    await this.cards.save({ id: 2, title: 'Composants UI', description: 'Créer les composants Button, Input, Card, Modal.', orderColumn: 1, columnId: 1, dueDate: '2025-04-20', assigneeId: 2, labelIds: [1, 2] });
    await this.cards.save({ id: 3, title: 'Page accueil responsive', description: 'Terminer la mise en page responsive.', orderColumn: 0, columnId: 2, dueDate: '2025-04-10', assigneeId: 1, labelIds: [2] });
    await this.cards.save({ id: 4, title: 'Documentation', description: 'Écrire la documentation du design system.', orderColumn: 1, columnId: 3, dueDate: '2025-04-05', assigneeId: 2, labelIds: [3] });
    await this.cards.save({ id: 5, title: 'Wireframes', description: 'Wireframes validés par le client.', orderColumn: 0, columnId: 4, dueDate: '2025-04-08', assigneeId: 1, labelIds: [2] });
    await this.cards.save({ id: 6, title: 'Maquette Figma', description: 'Maquette haute fidélité.', orderColumn: 0, columnId: 5, dueDate: '2025-04-18', assigneeId: 1, labelIds: [1] });
    await this.cards.save({ id: 7, title: 'Tests utilisateurs', description: 'Sessions de tests utilisateurs.', orderColumn: 0, columnId: 6, dueDate: '2025-04-12', assigneeId: 2, labelIds: [3] });
    await this.cards.save({ id: 8, title: 'Analyse concurrents', description: 'Analyse des concurrents directs.', orderColumn: 0, columnId: 7, dueDate: '2025-04-14', assigneeId: 1, labelIds: [2] });
    await this.cards.save({ id: 9, title: 'Stratégie contenu', description: 'Plan de contenu pour les réseaux sociaux.', orderColumn: 1, columnId: 7, dueDate: '2025-04-22', assigneeId: 2, labelIds: [1, 4] });
    await this.cards.save({ id: 10, title: 'Campagne emailing', description: 'Campagne emailing Q2.', orderColumn: 0, columnId: 8, dueDate: '2025-04-25', assigneeId: 1, labelIds: [4] });

    // Comments
    await this.comments.save({ id: 1, text: "J'ai commencé la palette.", authorId: 1, cardId: 1 });
    await this.comments.save({ id: 2, text: 'Je valide le violet.', authorId: 2, cardId: 1 });
    await this.comments.save({ id: 3, text: 'PR créé.', authorId: 1, cardId: 3 });
    await this.comments.save({ id: 4, text: "J'ai ajouté les variantes disabled et loading.", authorId: 2, cardId: 2 });
    await this.comments.save({ id: 5, text: 'Review faite, quelques suggestions.', authorId: 1, cardId: 2 });

    // Invitations
    await this.invitations.save({ id: 1, boardId: 1, email: 'marc@protask.dev', invitedById: 1, status: 'accepted' });
    await this.invitations.save({ id: 2, boardId: 1, email: 'julie@test.com', invitedById: 1, status: 'pending' });
  }
}
