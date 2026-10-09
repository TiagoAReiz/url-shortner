import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  AdminGuard,
  AuthGuard,
  CurrentUser,
} from '../../../auth/adapters/inbound/guards/auth.guards.js';
import { AuthService } from '../../../auth/application/services/auth.service.js';
import type { User } from '../../../auth/domain/user.entity.js';
import { NotFoundUrl } from '../../../shortner/domain/exceptions/not-found-url.js';
import {
  ForbiddenLink,
  StatsService,
} from '../../application/services/stats.service.js';

@Controller()
export class StatsController {
  constructor(
    private readonly stats: StatsService,
    private readonly auth: AuthService,
  ) {}

  /** Links do usuário logado, com total de acessos. */
  @Get('me/links')
  @UseGuards(AuthGuard)
  myLinks(@CurrentUser() user: User) {
    return this.stats.listMyLinks(user.id);
  }

  /** Estatísticas de um link (dono ou admin). */
  @Get('links/:id/stats')
  @UseGuards(AuthGuard)
  async linkStats(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      return await this.stats.linkStats(id, {
        id: user.id,
        isAdmin: this.auth.isAdmin(user),
      });
    } catch (error) {
      if (error instanceof NotFoundUrl)
        throw new NotFoundException(error.message);
      if (error instanceof ForbiddenLink)
        throw new ForbiddenException(error.message);
      throw error;
    }
  }

  /** Visão geral do app, só para admin (ADMIN_EMAILS). Inclui links sem dono. */
  @Get('admin/overview')
  @UseGuards(AdminGuard)
  overview() {
    return this.stats.adminOverview();
  }
}
