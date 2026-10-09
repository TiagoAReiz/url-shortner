import type {
  AccessRow,
  LinkSummary,
} from '../../domain/stats.types.js';

export interface StatsRepository {
  /** Links do usuário, com o total de acessos de cada um. */
  listLinksByUser(userId: string): Promise<LinkSummary[]>;
  /** Todos os links (donos e anônimos), com total de acessos. */
  listAllLinks(): Promise<LinkSummary[]>;
  getLink(id: string): Promise<Omit<LinkSummary, 'total_accesses'> | null>;
  listAccesses(linkId: string): Promise<AccessRow[]>;
  countUsers(): Promise<number>;
}

export const STATS_REPOSITORY = Symbol('STATS_REPOSITORY');
