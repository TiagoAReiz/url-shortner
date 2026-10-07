import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShortnerService } from '../../../application/services/shortner.service.js';
import { CreateShortnerDto } from './dto/create-shortner.dto.js';


@Controller('shortner')
export class ShortnerController {
  constructor(private readonly shortnerService: ShortnerService) {}

  @Post()
  create(@Body() createShortnerDto: CreateShortnerDto) {
    return this.shortnerService.create(createShortnerDto);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shortnerService.findOne(id);
  }
}
