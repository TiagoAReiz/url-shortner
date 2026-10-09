import { Injectable } from '@nestjs/common';
import type { Temporal } from 'temporal-polyfill';
import { db } from '../../../prisma/db.js';
import type { StatsRepository } from '../../application/ports/stats.repository.interface.js';
import type { AccessRow, LinkSummary } from '../../domain/stats.types.js';

const toDate = (i: Temporal.Instant) => new Date(i.epochMilliseconds);

type LinkRow = {
  id: string;
  destination_url: string;
  created_at: Temporal.Instant;
  expires_at: Temporal.Instant;
  user_id: string | null;
};

const toLink = (row: LinkRow): Omit<LinkSummary, 'total_accesses'> => ({
  id: row.id,
  destination_url: row.destination_url,
  created_at: toDate(row.created_at),
  expires_at: toDate(row.expires_at),
  user_id: row.user_id,
});

// Total de acessos por link (GROUP BY no banco).
async function countsByLink(ids?: string[]): Promise<Map<string, number>> {
  const base = ids
    ? db.orm.public.Access.where((a) => a.shortner_id.in(ids))
    : db.orm.public.Access;
  const rows = await base
    .groupBy('shortner_id')
    .aggregate((agg) => ({ total: agg.count() }));
  return new Map(rows.map((r) => [r.shortner_id, r.total]));
}

@Injectable()
export class StatsRepositoryImpl implements StatsRepository {
  async listLinksByUser(userId: string): Promise<LinkSummary[]> {
    const links = await db.orm.public.Shortner.where({ user_id: userId }).all();
    const counts = await countsByLink(links.map((l) => l.id));
    return links.map((l) => ({
      ...toLink(l),
      total_accesses: counts.get(l.id) ?? 0,
    }));
  }

  async listAllLinks(): Promise<LinkSummary[]> {
    const links = await db.orm.public.Shortner.all();
    const counts = await countsByLink();
    return links.map((l) => ({
      ...toLink(l),
      total_accesses: counts.get(l.id) ?? 0,
    }));
  }

  async getLink(id: string) {
    const row = await db.orm.public.Shortner.first({ id });
    return row ? toLink(row) : null;
  }

  async listAccesses(linkId: string): Promise<AccessRow[]> {
    const rows = await db.orm.public.Access.where({ shortner_id: linkId })
      .select('accessed_at', 'ip', 'user_agent', 'referer')
      .all();
    return rows.map((r) => ({ ...r, accessed_at: toDate(r.accessed_at) }));
  }

  async countUsers(): Promise<number> {
    const { total } = await db.orm.public.User.aggregate((agg) => ({
      total: agg.count(),
    }));
    return total;
  }
}
