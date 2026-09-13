import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateReferralPostDto } from './dto/create-referral-post.dto';
import { RespondReferralApplicationDto } from './dto/respond-referral-application.dto';
import { ReferralApplicationStatus } from './enums/referral-application-status.enum';

// A plain object shape (not the real `AlumniService` class) so
// `@typescript-eslint/unbound-method` doesn't treat these jest mocks as
// unbound class methods.
interface MockAlumniService {
  createReferralPost: Mock;
  getMyReferralPosts: Mock;
  getPendingReferralPosts: Mock;
  getApprovedReferralPosts: Mock;
  getReferralPostById: Mock;
  updateReferralPostStatus: Mock;
  getUnplacedStudents: Mock;
  applyToReferralPost: Mock;
  getApplicationsForAlumni: Mock;
  getApplicationsForStudent: Mock;
  getAcceptedApplicationCount: Mock;
  respondToApplication: Mock;
}

const createMockService = (): MockAlumniService => ({
  createReferralPost: jest.fn(),
  getMyReferralPosts: jest.fn(),
  getPendingReferralPosts: jest.fn(),
  getApprovedReferralPosts: jest.fn(),
  getReferralPostById: jest.fn(),
  updateReferralPostStatus: jest.fn(),
  getUnplacedStudents: jest.fn(),
  applyToReferralPost: jest.fn(),
  getApplicationsForAlumni: jest.fn(),
  getApplicationsForStudent: jest.fn(),
  getAcceptedApplicationCount: jest.fn(),
  respondToApplication: jest.fn(),
});

const asAlumni = (id: number): User => ({ id, role: UserRole.ALUMNI }) as User;

describe('AlumniController', () => {
  let controller: AlumniController;
  let service: MockAlumniService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlumniController],
      providers: [{ provide: AlumniService, useValue: createMockService() }],
    }).compile();

    controller = module.get<AlumniController>(AlumniController);
    service = module.get<MockAlumniService>(AlumniService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('creates a referral post on behalf of the logged-in alumni', () => {
    const user = asAlumni(7);
    const dto: CreateReferralPostDto = {
      title: 'Backend Intern',
      companyName: 'Akij IT',
      location: 'Remote',
      description: 'Build APIs',
      requiredSkills: ['Node.js'],
      vacancies: 1,
      deadline: '2026-10-01',
    };

    void controller.createReferralPost(dto, user);

    expect(service.createReferralPost).toHaveBeenCalledWith(7, dto);
  });

  it('responds to an application as the logged-in alumni', () => {
    const user = asAlumni(7);
    const dto: RespondReferralApplicationDto = {
      status: ReferralApplicationStatus.ACCEPTED,
    };

    void controller.respondToApplication(3, dto, user);

    expect(service.respondToApplication).toHaveBeenCalledWith(3, 7, dto);
  });
});
