import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  orderColumn: number;

  @Column()
  columnId: number;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @Column({ nullable: true })
  assigneeId: number;

  @Column({ type: 'simple-json', default: '[]' })
  labelIds: number[];

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: any;

  @ManyToOne('ProjectColumn', 'cards')
  @JoinColumn({ name: 'columnId' })
  column: any;

  @OneToMany('Comment', 'card')
  comments: any[];
}
