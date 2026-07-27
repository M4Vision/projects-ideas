import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class MockAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'] || '';

    if (!auth.startsWith('Bearer token-')) {
      throw new UnauthorizedException('Token manquant ou invalide.');
    }

    const userId = parseInt(auth.slice('Bearer token-'.length), 10);

    if (isNaN(userId) || userId <= 0) {
      throw new UnauthorizedException('Token invalide.');
    }

    request.userId = userId;
    return true;
  }
}
