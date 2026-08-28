import { Test, TestingModule } from '@nestjs/testing';
import { InternshipController } from './internship.controller';
import { InternshipService } from './internship.service';

describe('InternshipController', () => {
  let controller: InternshipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InternshipController],
      providers: [InternshipService],
    }).compile();

    controller = module.get<InternshipController>(InternshipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
