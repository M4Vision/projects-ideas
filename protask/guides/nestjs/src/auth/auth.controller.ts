import { Controller, Post, Body, Get, Put, Param, Req, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('auth/register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Public()
  @Post('auth/login')
  @HttpCode(200)
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Public()
  @Post('auth/logout')
  @HttpCode(200)
  logout() {
    return { success: true };
  }
}
