import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service.js';

@Module({
  controllers: [StatisticsService],
})
export class AppModule {}
