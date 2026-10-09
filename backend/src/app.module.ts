import { Module } from '@nestjs/common';
import { ShortnerModule } from './shortner/shortner.module.js';
import { AuthModule } from './auth/auth.module.js';
import { StatsModule } from './stats/stats.module.js';
import { RedisModule } from './config/redis/redis.module.js';

@Module({
  imports: [RedisModule, AuthModule, ShortnerModule, StatsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
