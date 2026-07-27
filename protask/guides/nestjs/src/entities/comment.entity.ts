import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column()
  authorId: number;

  @Column()
  cardId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne('User')
  @JoinColumn({ name: 'authorId' })
  author: any;

  @ManyToOne('Card', 'comments')
  @JoinColumn({ name: 'cardId' })
  card: any;
}
