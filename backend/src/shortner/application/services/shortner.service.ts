import { Inject, Injectable } from '@nestjs/common';
import { CreateShortnerDto } from '../../adapters/inbound/controllers/dto/create-shortner.dto.js';
import { ShortnerServiceInterface } from '../ports/inbound/services/shortner.service.interface.js';
import {
  SHORTNER_REPOSITORY,
  type ShortnerRepository,
} from '../ports/outbound/repositories/shortner.repository.interface.js';
import {
  CACHE,
  type CacheInterface,
} from '../ports/outbound/cache/cache.interface.js';
import { NotFoundUrl } from '../../domain/exceptions/not-found-url.js';
import {
  EVENT_PUBLISHER,
  type EventPublisher,
} from '../ports/outbound/messaging/event-publisher.interface.js';
import type { VisitorContext } from '../../domain/entities/visitor-context.js';
import { ShortnerMapper } from '../mappers/shortner.mapper.js';

@Injectable()
export class ShortnerService implements ShortnerServiceInterface {
  constructor(
    @Inject(SHORTNER_REPOSITORY) private readonly repo: ShortnerRepository,
    @Inject(CACHE) private readonly cache: CacheInterface,
    @Inject(EVENT_PUBLISHER) private readonly publisher: EventPublisher,
  ) {}

  async create(
    createShortnerDto: CreateShortnerDto,
    userId?: string,
  ): Promise<string> {
    const shortner = ShortnerMapper.toEntity(createShortnerDto, userId);
    const saved = await this.repo.save(shortner);
    return `${this.appUrl}/${saved.id}`;
  }

  private get appUrl(): string {
    const url = process.env['APP_URL'];
    if (!url) throw new Error('APP_URL não configurada');
    return url.replace(/\/+$/, '');
  }

  async findOne(id: string, visitor: VisitorContext = {}): Promise<string> {
    const cached = await this.cache.getByKey(id);
    if (cached) {
      this.trackAccess(id, visitor);
      return cached;
    }

    const shortner = await this.repo.getById(id);
    if (!shortner) throw new NotFoundUrl(id);

    await this.cache.createCache(id, shortner.destination_url);
    this.trackAccess(id, visitor);
    return shortner.destination_url;
  }

  private trackAccess(id: string, visitor: VisitorContext): void {
    this.publisher.linkAccessed({
      id,
      accessedAt: new Date().toISOString(),
      ...visitor,
    });
  }
}
