import { Test, TestingModule } from '@nestjs/testing';
import { ContentItemController } from './content-item.controller';

describe('ContentItemController', () => {
  let controller: ContentItemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentItemController],
    }).compile();

    controller = module.get<ContentItemController>(ContentItemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
