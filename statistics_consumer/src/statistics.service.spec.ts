import { StatisticsService } from './statistics.service.js';

describe('StatisticsService', () => {
  const channel = { ack: vi.fn(), nack: vi.fn() };
  const message = { content: 'x' };
  const context = {
    getChannelRef: () => channel,
    getMessage: () => message,
  };
  const event = { id: 'abc1234', accessedAt: '2026-01-01T00:00:00.000Z' };

  beforeEach(() => vi.resetAllMocks());

  it('dá ack depois de processar o evento', async () => {
    await new StatisticsService().handleLinkAccessed(event, context as never);

    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });
});
