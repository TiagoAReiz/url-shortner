import { Controller, Get, Post, Body, Patch, Param, Delete, Redirect, NotFoundException, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { NotFoundUrl } from '../../../domain/exceptions/not-found-url.js';
import { OptionalAuthGuard, CurrentUser } from '../../../../auth/adapters/inbound/guards/auth.guards.js';
import type { User } from '../../../../auth/domain/user.entity.js';
import { ShortnerService } from '../../../application/services/shortner.service.js';
import { CreateShortnerDto } from './dto/create-shortner.dto.js';


@Controller()
export class ShortnerController {
  constructor(private readonly shortnerService: ShortnerService) {}

  // Anônimo pode criar; se estiver logado, o link fica atrelado ao usuário.
  @Post('shortner')
  @UseGuards(OptionalAuthGuard)
  async create(
    @Body() createShortnerDto: CreateShortnerDto,
    @CurrentUser() user?: User,
  ) {
    const short_url = await this.shortnerService.create(
      createShortnerDto,
      user?.id,
    );
    return { short_url };
  }
  @Get(':id')
  @Redirect()
  async findOne(@Param('id') id: string, @Req() req: Request) {
    try {
      const url = await this.shortnerService.findOne(id, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'],
      });
      return { url, statusCode: 302 };
    } catch (error) {
      if (error instanceof NotFoundUrl) throw new NotFoundException(error.message);
      throw error;
    }
  }
}
