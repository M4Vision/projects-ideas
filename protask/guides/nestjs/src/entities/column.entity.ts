import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Board } from './board.entity';

@Entity('project_columns')
export class ProjectColumn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column()
  orderColumn: number;

  @Column()
  boardId: number;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Board, board => board.columns)
  @JoinColumn({ name: 'boardId' })
  board: Board;

  @OneToMany('Card', 'column')
  cards: any[];
}
