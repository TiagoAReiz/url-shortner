import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  type EventPublisher,
  type LinkAccessedEvent,
} from '../../../application/ports/outbound/messaging/event-publisher.interface.js';

export const STATS_CLIENT = Symbol('STATS_CLIENT');
export const LINK_ACCESSED_PATTERN = 'link.accessed';

@Injectable()
export class RabbitPublisher implements EventPublisher {
  private readonly logger = new Logger(RabbitPublisher.name);

  constructor(@Inject(STATS_CLIENT) private readonly client: ClientProxy) {}

  // Fire-and-forget: falha no broker não pode derrubar o redirect.
  linkAccessed(event: LinkAccessedEvent): void {
    this.client.emit(LINK_ACCESSED_PATTERN, event).subscribe({
      error: (err) =>
        this.logger.error(`Falha ao publicar ${LINK_ACCESSED_PATTERN}: ${err}`),
    });
  }
}
