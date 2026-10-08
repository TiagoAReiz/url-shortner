import { Module } from '@nestjs/common';
import { ShortnerService } from './application/services/shortner.service.js';
import { ShortnerController } from './adapters/inbound/controllers/shortner.controller.js';
import { SHORTNER_REPOSITORY } from './application/ports/outbound/repositories/shortner.repository.interface.js';
import { CACHE } from './application/ports/outbound/cache/cache.interface.js';
import { ShortnerRepositoryImpl } from './adapters/outbound/repositories/shortner.repository.js';
import { RedisClient } from './adapters/outbound/cache/redis.client.js';

@Module({
  controllers: [ShortnerController],
  providers: [
    ShortnerService,
    { provide: SHORTNER_REPOSITORY, useClass: ShortnerRepositoryImpl },
    { provide: CACHE, useClass: RedisClient },
  ],
})
export class ShortnerModule {}
