import { Test, TestingModule } from '@nestjs/testing';
import { ShortnerController } from './shortner.controller.js';
import { ShortnerService } from '../../../application/services/shortner.service.js';

describe('ShortnerController', () => {
  let controller: ShortnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortnerController],
      providers: [ShortnerService],
    }).compile();

    controller = module.get<ShortnerController>(ShortnerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
