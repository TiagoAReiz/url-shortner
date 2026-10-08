import { Controller, Get, Post, Body, Patch, Param, Delete, Redirect, NotFoundException, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NotFoundUrl } from '../../../domain/exceptions/not-found-url.js';
import { ShortnerService } from '../../../application/services/shortner.service.js';
import { CreateShortnerDto } from './dto/create-shortner.dto.js';


@Controller()
export class ShortnerController {
  constructor(private readonly shortnerService: ShortnerService) {}

  @Post('shortner')
  async create(@Body() createShortnerDto: CreateShortnerDto) {
    const short_url = await this.shortnerService.create(createShortnerDto);
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
