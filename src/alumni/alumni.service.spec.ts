import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AlumniService } from './alumni.service';
import { ReferralPost } from './entities/referral-post.entity';
import { ReferralApplication } from './entities/referral-application.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Resume } from '../resume/entities/resume.entity';
import { ReferralPostStatus } from './enums/referral-post-status.enum';
import { ReferralApplicationStatus } from './enums/referral-application-status.enum';

interface FakeRepo {
  find: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
  findOne: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
  create: jest.Mock<(entity: unknown) => unknown>;
  save: jest.Mock<(entity: unknown) => Promise<unknown>>;
  count: jest.Mock<(...args: unknown[]) => Promise<unknown>>;
}

const createFakeRepo = (): FakeRepo => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((entity: unknown) => entity),
  save: jest.fn((entity: unknown) => Promise.resolve(entity)),
  count: jest.fn(),
});

describe('AlumniService', () => {
  let service: AlumniService;
  let referralPostRepo: FakeRepo;
  let referralApplicationRepo: FakeRepo;
  let userRepo: FakeRepo;
  let resumeRepo: FakeRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlumniService,
        {
          provide: getRepositoryToken(ReferralPost),
          useValue: createFakeRepo(),
        },
        {
          provide: getRepositoryToken(ReferralApplication),
          useValue: createFakeRepo(),
        },
        { provide: getRepositoryToken(User), useValue: createFakeRepo() },
        { provide: getRepositoryToken(Resume), useValue: createFakeRepo() },
      ],
    }).compile();

    service = module.get<AlumniService>(AlumniService);
    referralPostRepo = module.get<FakeRepo>(getRepositoryToken(ReferralPost));
    referralApplicationRepo = module.get<FakeRepo>(
      getRepositoryToken(ReferralApplication),
    );
    userRepo = module.get<FakeRepo>(getRepositoryToken(User));
    resumeRepo = module.get<FakeRepo>(getRepositoryToken(Resume));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReferralPost', () => {
    it('creates a post with PENDING status', async () => {
      userRepo.find.mockResolvedValue([]);

      const result = await service.createReferralPost(1, {
        title: 'Frontend Intern',
        companyName: 'Akij IT',
        location: 'Dhaka',
        description: 'Great role',
        requiredSkills: ['React'],
        vacancies: 2,
        deadline: '2026-10-15',
      });

      expect(result.status).toBe(ReferralPostStatus.PENDING);
      expect(referralPostRepo.save).toHaveBeenCalled();
    });

    it('rejects unknown suggested student ids', async () => {
      userRepo.find.mockResolvedValue([{ id: 101 } as User]);

      await expect(
        service.createReferralPost(1, {
          title: 'Frontend Intern',
          companyName: 'Akij IT',
          location: 'Dhaka',
          description: 'Great role',
          requiredSkills: ['React'],
          vacancies: 2,
          deadline: '2026-10-15',
          suggestedStudentIds: [101, 102],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('respondToApplication', () => {
    const baseApplication: Partial<ReferralApplication> = {
      id: 1,
      status: ReferralApplicationStatus.PENDING,
      responseMessage: null,
      respondedAt: null,
      referralPost: {
        id: 10,
        vacancies: 1,
        alumni: { id: 5 } as User,
      } as ReferralPost,
    };

    it('rejects a response from an alumni who does not own the post', async () => {
      referralApplicationRepo.findOne.mockResolvedValue(baseApplication);

      await expect(
        service.respondToApplication(1, 999, {
          status: ReferralApplicationStatus.ACCEPTED,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('refuses to accept once the vacancy is full', async () => {
      referralApplicationRepo.findOne.mockResolvedValue(baseApplication);
      referralApplicationRepo.count.mockResolvedValue(1);

      await expect(
        service.respondToApplication(1, 5, {
          status: ReferralApplicationStatus.ACCEPTED,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts the student when a vacancy is still open', async () => {
      referralApplicationRepo.findOne.mockResolvedValue({
        ...baseApplication,
      });
      referralApplicationRepo.count.mockResolvedValue(0);

      const result = await service.respondToApplication(1, 5, {
        status: ReferralApplicationStatus.ACCEPTED,
        responseMessage: "You're in!",
      });

      expect(result.status).toBe(ReferralApplicationStatus.ACCEPTED);
      expect(result.responseMessage).toBe("You're in!");
    });
  });

  describe('getUnplacedStudents', () => {
    it('excludes students with an accepted application', async () => {
      referralApplicationRepo.find.mockResolvedValue([
        {
          status: ReferralApplicationStatus.ACCEPTED,
          student: { id: 101 } as User,
        },
        {
          status: ReferralApplicationStatus.PENDING,
          student: { id: 102 } as User,
        },
      ]);
      userRepo.find.mockResolvedValue([
        {
          id: 101,
          firstName: 'Placed',
          lastName: 'Student',
          email: 'placed@student.edu',
          role: UserRole.STUDENT,
        } as User,
        {
          id: 102,
          firstName: 'Unplaced',
          lastName: 'Student',
          email: 'unplaced@student.edu',
          role: UserRole.STUDENT,
        } as User,
      ]);
      resumeRepo.find.mockResolvedValue([]);

      const result = await service.getUnplacedStudents();

      expect(result.map((s) => s.id)).toEqual([102]);
      expect(result[0].applicationCount).toBe(1);
    });
  });
});
