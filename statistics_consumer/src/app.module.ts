import { Module } from '@nestjs/common';
import { AccessRepository } from './access.repository.js';
import { StatisticsService } from './statistics.service.js';

@Module({
  controllers: [StatisticsService],
  providers: [AccessRepository],
})
export class AppModule {}
