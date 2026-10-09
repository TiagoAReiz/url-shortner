import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  GOOGLE_VERIFIER,
  type GoogleVerifier,
} from '../ports/google-verifier.interface.js';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../ports/user.repository.interface.js';
import type {
  AuthPayload,
  GoogleProfile,
  User,
} from '../../domain/user.entity.js';
import { InvalidCredentials } from '../../domain/invalid-credentials.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(GOOGLE_VERIFIER) private readonly google: GoogleVerifier,
    private readonly jwt: JwtService,
  ) {}

  async loginWithGoogle(
    idToken: string,
  ): Promise<{ user: User; token: string }> {
    let profile: GoogleProfile;
    try {
      profile = await this.google.verify(idToken);
    } catch {
      throw new InvalidCredentials('Token do Google inválido');
    }
    const user = await this.users.upsertFromGoogle(profile);
    const payload: AuthPayload = { sub: user.id, email: user.email };
    return { user, token: await this.jwt.signAsync(payload) };
  }

  /** Usuário dono do JWT, ou null se o token for inválido/expirado ou o usuário não existir mais. */
  async authenticate(token: string): Promise<User | null> {
    try {
      const payload = await this.jwt.verifyAsync<AuthPayload>(token);
      return await this.users.getById(payload.sub);
    } catch {
      return null;
    }
  }

  isAdmin(user: Pick<User, 'email'>): boolean {
    const admins = (process.env['ADMIN_EMAILS'] ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return admins.includes(user.email.toLowerCase());
  }
}
