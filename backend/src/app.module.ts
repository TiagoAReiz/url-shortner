import { Module } from '@nestjs/common';
import { ShortnerModule } from './shortner/shortner.module.js';
import { RedisModule } from './config/redis/redis.module.js';

@Module({
  imports: [RedisModule, ShortnerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
