import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async findById(id: number): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  async update(id: number, body: any): Promise<any> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    if (body.name !== undefined) user.name = body.name;
    if (body.email !== undefined) user.email = body.email;
    if (body.avatar !== undefined) user.avatar = body.avatar;
    await this.users.save(user);
    return user.toResponse();
  }
}
