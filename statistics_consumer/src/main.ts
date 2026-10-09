import 'temporal-polyfill/global';
import { NestFactory } from '@nestjs/core';
import { Transport, type MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env['RABBITMQ_URL'] ?? 'amqp://user:example@localhost:5672'],
        queue: 'link_accessed',
        queueOptions: { durable: true },
        noAck: false,
        prefetchCount: 10,
      },
    },
  );
  await app.listen();
}
await bootstrap();
