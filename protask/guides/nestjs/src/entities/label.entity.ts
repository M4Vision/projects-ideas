import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Label {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 7 })
  color: string;

  @Column()
  boardId: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}
