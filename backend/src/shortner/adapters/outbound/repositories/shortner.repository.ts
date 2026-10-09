import { Injectable } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { Shortner } from '../../../domain/entities/shortner.entity.js';
import { db } from '../../../../prisma/db.js';
import { type ShortnerRepository } from '../../../application/ports/outbound/repositories/shortner.repository.interface.js';

const toInstant = (date: Date) =>
  Temporal.Instant.fromEpochMilliseconds(date.getTime());
const toDate = (instant: Temporal.Instant) =>
  new Date(instant.epochMilliseconds);

@Injectable()
export class ShortnerRepositoryImpl implements ShortnerRepository {
  async save(url: Shortner): Promise<Shortner> {
    const row = await db.orm.public.Shortner.create({
      id: url.id,
      destination_url: url.destination_url,
      created_at: toInstant(url.created_at),
      expires_at: toInstant(url.expires_at),
      user_id: url.user_id,
    });
    return Object.assign(new Shortner(), row, {
      created_at: toDate(row.created_at),
      expires_at: toDate(row.expires_at),
    });
  }

  async getById(id: string): Promise<Shortner | null> {
    const row = await db.orm.public.Shortner.first({ id });
    if (!row) return null;
    return Object.assign(new Shortner(), row, {
      created_at: toDate(row.created_at),
      expires_at: toDate(row.expires_at),
    });
  }
}
