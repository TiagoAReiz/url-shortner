import { Inject, Injectable } from '@nestjs/common';
import {
  STATS_REPOSITORY,
  type StatsRepository,
} from '../ports/stats.repository.interface.js';
import type {
  AdminOverview,
  Count,
  LinkStats,
  LinkSummary,
} from '../../domain/stats.types.js';
import { NotFoundUrl } from '../../../shortner/domain/exceptions/not-found-url.js';

const TOP_N = 10;

export class ForbiddenLink extends Error {
  constructor(id: string) {
    super(`Sem permissão para o link ${id}`);
    this.name = 'ForbiddenLink';
  }
}

function top(values: (string | null)[], n = TOP_N): Count[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([value, count]) => ({ value, count }));
}

@Injectable()
export class StatsService {
  constructor(@Inject(STATS_REPOSITORY) private readonly repo: StatsRepository) {}

  listMyLinks(userId: string): Promise<LinkSummary[]> {
    return this.repo.listLinksByUser(userId);
  }

  /**
   * Estatísticas de um link. O dono vê o seu; admin vê qualquer um
   * (inclusive links anônimos, que não têm dono).
   */
  async linkStats(
    linkId: string,
    viewer: { id: string; isAdmin: boolean },
  ): Promise<LinkStats> {
    const link = await this.repo.getLink(linkId);
    if (!link) throw new NotFoundUrl(linkId);
    if (!viewer.isAdmin && link.user_id !== viewer.id)
      throw new ForbiddenLink(linkId);

    // Agregação em memória: ok para estudo; em escala, mover para GROUP BY no banco.
    const accesses = await this.repo.listAccesses(linkId);

    const byDay = new Map<string, number>();
    const visitors = new Set<string>();
    for (const a of accesses) {
      const day = a.accessed_at.toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      visitors.add(`${a.ip ?? ''}|${a.user_agent ?? ''}`);
    }

    return {
      link,
      total_accesses: accesses.length,
      unique_visitors: visitors.size,
      accesses_by_day: [...byDay.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, count]) => ({ day, count })),
      top_referers: top(accesses.map((a) => a.referer)),
      top_user_agents: top(accesses.map((a) => a.user_agent)),
    };
  }

  async adminOverview(): Promise<AdminOverview> {
    const [links, users] = await Promise.all([
      this.repo.listAllLinks(),
      this.repo.countUsers(),
    ]);
    const anonymous = links.filter((l) => !l.user_id);
    const sum = (ls: LinkSummary[]) =>
      ls.reduce((acc, l) => acc + l.total_accesses, 0);

    return {
      users,
      links: {
        total: links.length,
        owned: links.length - anonymous.length,
        anonymous: anonymous.length,
      },
      accesses: { total: sum(links), on_anonymous_links: sum(anonymous) },
      top_links: [...links]
        .sort((a, b) => b.total_accesses - a.total_accesses)
        .slice(0, TOP_N),
    };
  }
}
