import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { db } from '../../../prisma/db.js';
import type { UserRepository } from '../../application/ports/user.repository.interface.js';
import { User, type GoogleProfile } from '../../domain/user.entity.js';

const toDate = (i: Temporal.Instant) => new Date(i.epochMilliseconds);

const toEntity = (row: {
  id: string;
  google_sub: string;
  email: string;
  name: string | null;
  picture: string | null;
  created_at: Temporal.Instant;
}): User =>
  Object.assign(new User(), row, { created_at: toDate(row.created_at) });

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  async upsertFromGoogle(profile: GoogleProfile): Promise<User> {
    const existing = await db.orm.public.User.first({
      google_sub: profile.sub,
    });
    if (existing) {
      const updated = await db.orm.public.User.where({ id: existing.id }).update(
        {
          email: profile.email,
          name: profile.name ?? null,
          picture: profile.picture ?? null,
        },
      );
      return toEntity(updated ?? existing);
    }
    const created = await db.orm.public.User.create({
      id: randomUUID(),
      google_sub: profile.sub,
      email: profile.email,
      name: profile.name ?? null,
      picture: profile.picture ?? null,
      created_at: Temporal.Now.instant(),
    });
    return toEntity(created);
  }

  async getById(id: string): Promise<User | null> {
    const row = await db.orm.public.User.first({ id });
    return row ? toEntity(row) : null;
  }
}
