import { StatisticsService } from './statistics.service.js';

describe('StatisticsService', () => {
  const channel = { ack: vi.fn(), nack: vi.fn() };
  const message = { content: 'x' };
  const context = {
    getChannelRef: () => channel,
    getMessage: () => message,
  };
  const accesses = { save: vi.fn() };
  const event = {
    id: 'abc1234',
    accessedAt: '2026-01-01T00:00:00.000Z',
    ip: '1.2.3.4',
    userAgent: 'UA',
    referer: 'https://t.co',
  };
  let service: StatisticsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new StatisticsService(accesses as never);
  });

  it('grava o acesso e dá ack', async () => {
    accesses.save.mockResolvedValue(undefined);

    await service.handleLinkAccessed(event, context as never);

    expect(accesses.save).toHaveBeenCalledWith({
      shortnerId: 'abc1234',
      accessedAt: '2026-01-01T00:00:00.000Z',
      ip: '1.2.3.4',
      userAgent: 'UA',
      referer: 'https://t.co',
    });
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('dá nack com requeue quando o insert falha', async () => {
    accesses.save.mockRejectedValue(new Error('db down'));

    await service.handleLinkAccessed(event, context as never);

    expect(channel.nack).toHaveBeenCalledWith(message, false, true);
    expect(channel.ack).not.toHaveBeenCalled();
  });
});
