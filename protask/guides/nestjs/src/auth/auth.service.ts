import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  async register(body: any) {
    if (!body.name || !body.email || !body.password) {
      throw new BadRequestException('Champs requis : name, email, password.');
    }
    const existing = await this.users.findOne({ where: { email: body.email } });
    if (existing) throw new BadRequestException('Cet email est déjà utilisé.');

    await this.users.save({
      id: body.id || undefined,
      name: body.name,
      email: body.email,
      password: body.password,
      avatar: body.avatar ?? '',
    });

    const user = await this.users.findOne({ where: { email: body.email } });
    return { user: user!.toResponse(), token: `token-${user!.id}` };
  }

  async login(body: any) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email et mot de passe requis.');
    }
    const user = await this.users.findOne({ where: { email: body.email } });
    if (!user || user.password !== body.password) {
      throw new UnauthorizedException('Email ou mot de passe incorrect.');
    }
    return { user: user.toResponse(), token: `token-${user.id}` };
  }
}
