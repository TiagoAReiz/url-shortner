import { Injectable } from '@nestjs/common';
import { Temporal } from 'temporal-polyfill';
import { db } from './prisma/db.js';

export interface NewAccess {
  shortnerId: string;
  accessedAt: string; // ISO-8601
  ip?: string;
  userAgent?: string;
  referer?: string;
}

@Injectable()
export class AccessRepository {
  async save(access: NewAccess): Promise<void> {
    await db.orm.public.Access.create({
      shortner_id: access.shortnerId,
      accessed_at: Temporal.Instant.from(access.accessedAt),
      ip: access.ip ?? null,
      user_agent: access.userAgent ?? null,
      referer: access.referer ?? null,
    });
  }
}
