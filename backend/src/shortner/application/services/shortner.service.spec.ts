import { ShortnerService } from './shortner.service.js';
import { NotFoundUrl } from '../../domain/exceptions/not-found-url.js';
import type { ShortnerRepository } from '../ports/outbound/repositories/shortner.repository.interface.js';
import type { CacheInterface } from '../ports/outbound/cache/cache.interface.js';

describe('ShortnerService', () => {
  let service: ShortnerService;
  let repo: { save: ReturnType<typeof vi.fn>; getById: ReturnType<typeof vi.fn> };
  let cache: {
    getByKey: ReturnType<typeof vi.fn>;
    createCache: ReturnType<typeof vi.fn>;
  };
  const originalAppUrl = process.env['APP_URL'];

  beforeEach(() => {
    repo = { save: vi.fn(), getById: vi.fn() };
    cache = { getByKey: vi.fn(), createCache: vi.fn() };
    service = new ShortnerService(
      repo as unknown as ShortnerRepository,
      cache as unknown as CacheInterface,
    );
    process.env['APP_URL'] = 'http://localhost:3000';
  });

  afterEach(() => {
    if (originalAppUrl === undefined) delete process.env['APP_URL'];
    else process.env['APP_URL'] = originalAppUrl;
  });

  describe('create', () => {
    it('salva a entidade e retorna APP_URL/id', async () => {
      repo.save.mockImplementation(async (s) => s);

      const result = await service.create({
        destination_url: 'https://example.com',
      } as never);

      const saved = repo.save.mock.calls[0]![0];
      expect(saved.destination_url).toBe('https://example.com');
      expect(saved.id).toMatch(/^[0-9A-Za-z]{7}$/);
      expect(result).toBe(`http://localhost:3000/${saved.id}`);
    });

    it('remove barras finais da APP_URL', async () => {
      process.env['APP_URL'] = 'http://localhost:3000///';
      repo.save.mockResolvedValue({ id: 'abc1234' });

      await expect(
        service.create({ destination_url: 'https://a.com' } as never),
      ).resolves.toBe('http://localhost:3000/abc1234');
    });

    it('lança erro se APP_URL não estiver configurada', async () => {
      delete process.env['APP_URL'];
      repo.save.mockResolvedValue({ id: 'abc1234' });

      await expect(
        service.create({ destination_url: 'https://a.com' } as never),
      ).rejects.toThrow('APP_URL não configurada');
    });
  });

  describe('findOne', () => {
    it('retorna do cache sem consultar o repositório', async () => {
      cache.getByKey.mockResolvedValue('https://cached.com');

      await expect(service.findOne('abc')).resolves.toBe('https://cached.com');
      expect(repo.getById).not.toHaveBeenCalled();
      expect(cache.createCache).not.toHaveBeenCalled();
    });

    it('em cache miss busca no repositório e popula o cache', async () => {
      cache.getByKey.mockResolvedValue(null);
      repo.getById.mockResolvedValue({ destination_url: 'https://db.com' });

      await expect(service.findOne('abc')).resolves.toBe('https://db.com');
      expect(repo.getById).toHaveBeenCalledWith('abc');
      expect(cache.createCache).toHaveBeenCalledWith('abc', 'https://db.com');
    });

    it('lança NotFoundUrl se não existir e não cacheia', async () => {
      cache.getByKey.mockResolvedValue(null);
      repo.getById.mockResolvedValue(null);

      await expect(service.findOne('nope')).rejects.toBeInstanceOf(NotFoundUrl);
      expect(cache.createCache).not.toHaveBeenCalled();
    });
  });
});
