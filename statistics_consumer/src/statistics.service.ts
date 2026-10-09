import { Controller, Logger } from '@nestjs/common';
import { AccessRepository } from './access.repository.js';
import {
  Ctx,
  EventPattern,
  Payload,
  type RmqContext,
} from '@nestjs/microservices';

export interface LinkAccessedEvent {
  id: string;
  accessedAt: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
}

// Handlers de @EventPattern só são registrados em classes @Controller,
// por isso o consumer é um "controller" mesmo sem HTTP.
@Controller()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private readonly accesses: AccessRepository) {}

  @EventPattern('link.accessed')
  async handleLinkAccessed(
    @Payload() event: LinkAccessedEvent,
    @Ctx() context: unknown, // tipado como unknown por causa da assinatura do decorator
  ): Promise<void> {
    const rmq = context as RmqContext;
    const channel = rmq.getChannelRef();
    const message = rmq.getMessage();
    try {
      await this.accesses.save({
        shortnerId: event.id,
        accessedAt: event.accessedAt,
        ip: event.ip,
        userAgent: event.userAgent,
        referer: event.referer,
      });
      channel.ack(message);
    } catch (error) {
      this.logger.error(`Falha ao processar ${event.id}: ${error}`);
      channel.nack(message, false, true); // devolve para a fila
    }
  }
}
