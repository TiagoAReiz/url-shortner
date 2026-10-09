import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { StatsController } from './adapters/inbound/stats.controller.js';
import { StatsRepositoryImpl } from './adapters/outbound/stats.repository.js';
import { STATS_REPOSITORY } from './application/ports/stats.repository.interface.js';
import { StatsService } from './application/services/stats.service.js';

@Module({
  imports: [AuthModule],
  controllers: [StatsController],
  providers: [
    StatsService,
    { provide: STATS_REPOSITORY, useClass: StatsRepositoryImpl },
  ],
})
export class StatsModule {}
