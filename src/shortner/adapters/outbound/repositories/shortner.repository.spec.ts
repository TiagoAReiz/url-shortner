import { Temporal } from 'temporal-polyfill';
import { Shortner } from '../../../domain/entities/shortner.entity.js';

const { create, first } = vi.hoisted(() => ({
  create: vi.fn(),
  first: vi.fn(),
}));

vi.mock('../../../../prisma/db.js', () => ({
  db: { orm: { public: { Shortner: { create, first } } } },
}));

import { ShortnerRepositoryImpl } from './shortner.repository.js';

const created = new Date('2026-01-01T00:00:00.000Z');
const expires = new Date('2026-01-31T00:00:00.000Z');
const row = {
  id: 'abc1234',
  destination_url: 'https://example.com',
  created_at: Temporal.Instant.fromEpochMilliseconds(created.getTime()),
  expires_at: Temporal.Instant.fromEpochMilliseconds(expires.getTime()),
};

describe('ShortnerRepositoryImpl', () => {
  let repo: ShortnerRepositoryImpl;

  beforeEach(() => {
    vi.resetAllMocks();
    repo = new ShortnerRepositoryImpl();
  });

  describe('save', () => {
    it('converte Date -> Instant ao gravar e Instant -> Date ao retornar', async () => {
      create.mockResolvedValue(row);
      const entity = Object.assign(new Shortner(), {
        id: 'abc1234',
        destination_url: 'https://example.com',
        created_at: created,
        expires_at: expires,
      });

      const result = await repo.save(entity);

      const arg = create.mock.calls[0]![0];
      expect(arg.id).toBe('abc1234');
      expect(arg.destination_url).toBe('https://example.com');
      expect(arg.created_at.epochMilliseconds).toBe(created.getTime());
      expect(arg.expires_at.epochMilliseconds).toBe(expires.getTime());

      expect(result).toBeInstanceOf(Shortner);
      expect(result.created_at).toEqual(created);
      expect(result.expires_at).toEqual(expires);
    });
  });

  describe('getById', () => {
    it('retorna a entidade com datas convertidas', async () => {
      first.mockResolvedValue(row);

      const result = await repo.getById('abc1234');

      expect(first).toHaveBeenCalledWith({ id: 'abc1234' });
      expect(result).toBeInstanceOf(Shortner);
      expect(result).toMatchObject({
        id: 'abc1234',
        destination_url: 'https://example.com',
        created_at: created,
        expires_at: expires,
      });
    });

    it('retorna null quando não encontra', async () => {
      first.mockResolvedValue(null);

      await expect(repo.getById('nope')).resolves.toBeNull();
    });
  });
});
