import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  boardId: number;

  @Column({ length: 180 })
  email: string;

  @Column()
  invitedById: number;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
