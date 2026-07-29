import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { Interview } from './interview.entity';
import { Application } from '../application/entities/application.entity';

describe('InterviewService', () => {
  let service: InterviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        {
          provide: getRepositoryToken(Interview),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Application),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
