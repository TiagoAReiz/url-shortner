import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShortnerController } from './shortner.controller.js';
import { ShortnerService } from '../../../application/services/shortner.service.js';
import { OptionalAuthGuard } from '../../../../auth/adapters/inbound/guards/auth.guards.js';
import { NotFoundUrl } from '../../../domain/exceptions/not-found-url.js';

describe('ShortnerController', () => {
  let controller: ShortnerController;
  const service = { create: vi.fn(), findOne: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortnerController],
      providers: [{ provide: ShortnerService, useValue: service }],
    })
      .overrideGuard(OptionalAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ShortnerController);
  });

  it('create atrela o link ao usuário logado', async () => {
    service.create.mockResolvedValue('http://x/abc');

    const res = await controller.create(
      { destination_url: 'https://a.com' },
      { id: 'u1' } as never,
    );

    expect(service.create).toHaveBeenCalledWith(
      { destination_url: 'https://a.com' },
      'u1',
    );
    expect(res).toEqual({ short_url: 'http://x/abc' });
  });

  it('create funciona sem login (anônimo)', async () => {
    service.create.mockResolvedValue('http://x/abc');

    await controller.create({ destination_url: 'https://a.com' }, undefined);

    expect(service.create).toHaveBeenCalledWith(
      { destination_url: 'https://a.com' },
      undefined,
    );
  });

  it('findOne redireciona com 302 e repassa o contexto do visitante', async () => {
    service.findOne.mockResolvedValue('https://dest.com');
    const req = {
      ip: '1.2.3.4',
      headers: { 'user-agent': 'UA', referer: 'https://t.co' },
    };

    const res = await controller.findOne('abc', req as never);

    expect(res).toEqual({ url: 'https://dest.com', statusCode: 302 });
    expect(service.findOne).toHaveBeenCalledWith('abc', {
      ip: '1.2.3.4',
      userAgent: 'UA',
      referer: 'https://t.co',
    });
  });

  it('findOne vira 404 quando o link não existe', async () => {
    service.findOne.mockRejectedValue(new NotFoundUrl('nope'));

    await expect(
      controller.findOne('nope', { headers: {} } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
