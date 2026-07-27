import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 180, unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  toResponse(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar ?? '',
      createdAt: this.createdAt?.toISOString?.() ?? this.createdAt,
    };
  }
}
