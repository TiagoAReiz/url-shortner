import { Test, TestingModule } from '@nestjs/testing';
import { ShortnerService } from './shortner.service.js';

describe('ShortnerService', () => {
  let service: ShortnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortnerService],
    }).compile();

    service = module.get<ShortnerService>(ShortnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
