import type { VisitorContext } from '../../../../domain/entities/visitor-context.js';

export interface LinkAccessedEvent extends VisitorContext {
  id: string;
  accessedAt: string;
}

export interface EventPublisher {
  linkAccessed(event: LinkAccessedEvent): void;
}

export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');
