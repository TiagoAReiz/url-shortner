import { Module } from '@nestjs/common';
import { ShortnerService } from './application/services/shortner.service.js';
import { ShortnerController } from './adapters/inbound/controllers/shortner.controller.js';

@Module({
  controllers: [ShortnerController],
  providers: [ShortnerService],
})
export class ShortnerModule {}
