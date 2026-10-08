import { Controller, Logger } from '@nestjs/common';
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

  @EventPattern('link.accessed')
  async handleLinkAccessed(
    @Payload() event: LinkAccessedEvent,
    @Ctx() context: unknown, // tipado como unknown por causa da assinatura do decorator
  ): Promise<void> {
    const rmq = context as RmqContext;
    const channel = rmq.getChannelRef();
    const message = rmq.getMessage();
    try {
      // TODO: gravar a estatística no banco
      this.logger.log(
        `Link ${event.id} acessado em ${event.accessedAt} ip=${event.ip} ua=${event.userAgent} ref=${event.referer}`,
      );
      channel.ack(message);
    } catch (error) {
      this.logger.error(`Falha ao processar ${event.id}: ${error}`);
      channel.nack(message, false, true); // devolve para a fila
    }
  }
}
