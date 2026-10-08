import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ShortnerService } from './application/services/shortner.service.js';
import { ShortnerController } from './adapters/inbound/controllers/shortner.controller.js';
import { SHORTNER_REPOSITORY } from './application/ports/outbound/repositories/shortner.repository.interface.js';
import { CACHE } from './application/ports/outbound/cache/cache.interface.js';
import { ShortnerRepositoryImpl } from './adapters/outbound/repositories/shortner.repository.js';
import { EVENT_PUBLISHER } from './application/ports/outbound/messaging/event-publisher.interface.js';
import {
  RabbitPublisher,
  STATS_CLIENT,
} from './adapters/outbound/messaging/rabbit.publisher.js';
import { RedisClient } from './adapters/outbound/cache/redis.client.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: STATS_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [process.env['RABBITMQ_URL'] ?? 'amqp://user:example@localhost:5672'],
          queue: 'link_accessed',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [ShortnerController],
  providers: [
    ShortnerService,
    { provide: SHORTNER_REPOSITORY, useClass: ShortnerRepositoryImpl },
    { provide: CACHE, useClass: RedisClient },
    { provide: EVENT_PUBLISHER, useClass: RabbitPublisher },
  ],
})
export class ShortnerModule {}
