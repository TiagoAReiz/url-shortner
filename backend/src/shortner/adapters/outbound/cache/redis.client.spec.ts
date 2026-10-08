import { RedisClient } from './redis.client.js';

describe('RedisClient', () => {
  const redis = { get: vi.fn(), set: vi.fn() };
  let client: RedisClient;

  beforeEach(() => {
    vi.resetAllMocks();
    client = new RedisClient(redis as never);
  });

  it('getByKey retorna o valor do redis', async () => {
    redis.get.mockResolvedValue('https://example.com');

    await expect(client.getByKey('abc')).resolves.toBe('https://example.com');
    expect(redis.get).toHaveBeenCalledWith('abc');
  });

  it('getByKey retorna null quando a chave não existe', async () => {
    redis.get.mockResolvedValue(null);

    await expect(client.getByKey('abc')).resolves.toBeNull();
  });

  it('createCache grava com TTL de 12h', async () => {
    redis.set.mockResolvedValue('OK');

    await client.createCache('abc', 'https://example.com');

    expect(redis.set).toHaveBeenCalledWith('abc', 'https://example.com', {
      EX: 60 * 60 * 12,
    });
  });

  it('propaga erros do redis', async () => {
    redis.get.mockRejectedValue(new Error('down'));

    await expect(client.getByKey('abc')).rejects.toThrow('down');
  });
});
