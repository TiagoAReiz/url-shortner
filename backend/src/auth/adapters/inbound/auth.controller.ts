import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import type { Response } from 'express';
import { AuthService } from '../../application/services/auth.service.js';
import { InvalidCredentials } from '../../domain/invalid-credentials.js';
import type { User } from '../../domain/user.entity.js';
import { AUTH_COOKIE, AuthGuard, CurrentUser } from './guards/auth.guards.js';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  id_token: string;
}

const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias (igual ao JWT)

function cookieOptions() {
  const secure = process.env['NODE_ENV'] === 'production';
  return {
    httpOnly: true,
    secure,
    // SPA em outra origem em produção precisa de SameSite=None (+ Secure).
    sameSite: secure ? ('none' as const) : ('lax' as const),
    path: '/',
  };
}

const present = (u: User) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  picture: u.picture,
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('google')
  @HttpCode(200)
  async google(
    @Body() dto: GoogleLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { user, token } = await this.auth.loginWithGoogle(dto.id_token);
      res.cookie(AUTH_COOKIE, token, {
        ...cookieOptions(),
        maxAge: COOKIE_MAX_AGE_MS,
      });
      return { user: present(user), is_admin: this.auth.isAdmin(user) };
    } catch (error) {
      if (error instanceof InvalidCredentials)
        throw new UnauthorizedException(error.message);
      throw error;
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return { user: present(user), is_admin: this.auth.isAdmin(user) };
  }

  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE, cookieOptions());
  }
}
