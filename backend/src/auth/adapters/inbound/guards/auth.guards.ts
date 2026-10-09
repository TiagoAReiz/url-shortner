import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../../../application/services/auth.service.js';
import type { User } from '../../../domain/user.entity.js';

export const AUTH_COOKIE = 'token';

type AuthedRequest = Request & { user?: User };

async function resolveUser(
  auth: AuthService,
  req: AuthedRequest,
): Promise<User | null> {
  const token = req.cookies?.[AUTH_COOKIE] as string | undefined;
  return token ? auth.authenticate(token) : null;
}

/** Preenche req.user se houver sessão válida, mas nunca bloqueia (acesso anônimo permitido). */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const user = await resolveUser(this.auth, req);
    if (user) req.user = user;
    return true;
  }
}

/** Exige sessão válida. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const user = await resolveUser(this.auth, req);
    if (!user) throw new UnauthorizedException('Faça login');
    req.user = user;
    return true;
  }
}

/** Exige sessão válida de um e-mail listado em ADMIN_EMAILS. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const user = await resolveUser(this.auth, req);
    if (!user) throw new UnauthorizedException('Faça login');
    if (!this.auth.isAdmin(user)) throw new ForbiddenException();
    req.user = user;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User | undefined =>
    ctx.switchToHttp().getRequest<AuthedRequest>().user,
);
