import { ForbiddenLink, StatsService } from './stats.service.js';
import { NotFoundUrl } from '../../../shortner/domain/exceptions/not-found-url.js';

const link = (over = {}) => ({
  id: 'abc',
  destination_url: 'https://x.com',
  created_at: new Date('2026-01-01'),
  expires_at: new Date('2026-02-01'),
  user_id: 'owner',
  ...over,
});

describe('StatsService', () => {
  const repo = {
    listLinksByUser: vi.fn(),
    listAllLinks: vi.fn(),
    getLink: vi.fn(),
    listAccesses: vi.fn(),
    countUsers: vi.fn(),
  };
  let service: StatsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new StatsService(repo as never);
  });

  describe('linkStats', () => {
    const accesses = [
      { accessed_at: new Date('2026-01-01T10:00:00Z'), ip: '1.1.1.1', user_agent: 'A', referer: 'https://t.co' },
      { accessed_at: new Date('2026-01-01T11:00:00Z'), ip: '1.1.1.1', user_agent: 'A', referer: 'https://t.co' },
      { accessed_at: new Date('2026-01-02T09:00:00Z'), ip: '2.2.2.2', user_agent: 'B', referer: null },
    ];

    it('agrega total, únicos, acessos por dia e tops para o dono', async () => {
      repo.getLink.mockResolvedValue(link());
      repo.listAccesses.mockResolvedValue(accesses);

      const stats = await service.linkStats('abc', { id: 'owner', isAdmin: false });

      expect(stats.total_accesses).toBe(3);
      expect(stats.unique_visitors).toBe(2);
      expect(stats.accesses_by_day).toEqual([
        { day: '2026-01-01', count: 2 },
        { day: '2026-01-02', count: 1 },
      ]);
      expect(stats.top_referers).toEqual([{ value: 'https://t.co', count: 2 }]);
      expect(stats.top_user_agents).toEqual([
        { value: 'A', count: 2 },
        { value: 'B', count: 1 },
      ]);
    });

    it('admin pode ver link de outro usuário e link anônimo', async () => {
      repo.getLink.mockResolvedValue(link({ user_id: null }));
      repo.listAccesses.mockResolvedValue([]);

      await expect(
        service.linkStats('abc', { id: 'admin', isAdmin: true }),
      ).resolves.toMatchObject({ total_accesses: 0 });
    });

    it('nega para quem não é dono nem admin', async () => {
      repo.getLink.mockResolvedValue(link());

      await expect(
        service.linkStats('abc', { id: 'outro', isAdmin: false }),
      ).rejects.toBeInstanceOf(ForbiddenLink);
      expect(repo.listAccesses).not.toHaveBeenCalled();
    });

    it('nega link anônimo para usuário comum', async () => {
      repo.getLink.mockResolvedValue(link({ user_id: null }));

      await expect(
        service.linkStats('abc', { id: 'u', isAdmin: false }),
      ).rejects.toBeInstanceOf(ForbiddenLink);
    });

    it('lança NotFoundUrl se o link não existir', async () => {
      repo.getLink.mockResolvedValue(null);

      await expect(
        service.linkStats('nope', { id: 'u', isAdmin: true }),
      ).rejects.toBeInstanceOf(NotFoundUrl);
    });
  });

  describe('adminOverview', () => {
    it('separa links com dono dos anônimos e soma os acessos', async () => {
      repo.countUsers.mockResolvedValue(2);
      repo.listAllLinks.mockResolvedValue([
        { ...link({ id: 'a' }), total_accesses: 5 },
        { ...link({ id: 'b', user_id: null }), total_accesses: 3 },
        { ...link({ id: 'c', user_id: null }), total_accesses: 1 },
      ]);

      const o = await service.adminOverview();

      expect(o.users).toBe(2);
      expect(o.links).toEqual({ total: 3, owned: 1, anonymous: 2 });
      expect(o.accesses).toEqual({ total: 9, on_anonymous_links: 4 });
      expect(o.top_links.map((l) => l.id)).toEqual(['a', 'b', 'c']);
    });
  });
});
