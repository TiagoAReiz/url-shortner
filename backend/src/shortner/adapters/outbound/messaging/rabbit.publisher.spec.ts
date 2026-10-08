import { throwError, of } from 'rxjs';
import {
  LINK_ACCESSED_PATTERN,
  RabbitPublisher,
} from './rabbit.publisher.js';

describe('RabbitPublisher', () => {
  const client = { emit: vi.fn() };
  let publisher: RabbitPublisher;
  const event = { id: 'abc1234', accessedAt: '2026-01-01T00:00:00.000Z' };

  beforeEach(() => {
    vi.resetAllMocks();
    publisher = new RabbitPublisher(client as never);
  });

  it('emite o evento link.accessed com o payload', () => {
    client.emit.mockReturnValue(of(undefined));

    publisher.linkAccessed(event);

    expect(client.emit).toHaveBeenCalledWith(LINK_ACCESSED_PATTERN, event);
  });

  it('não lança quando o broker falha', () => {
    client.emit.mockReturnValue(throwError(() => new Error('broker down')));

    expect(() => publisher.linkAccessed(event)).not.toThrow();
  });
});
