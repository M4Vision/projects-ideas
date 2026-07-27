import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column()
  ownerId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 7, nullable: true })
  color: string;

  @Column({ type: 'simple-json', nullable: true })
  categories: string[];

  @Column({ type: 'simple-json', default: '[]' })
  memberIds: number[];

  @OneToMany('ProjectColumn', 'board')
  columns: any[];
}
