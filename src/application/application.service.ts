import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResumeService } from '../resume/resume.service';
import { InternshipService } from '../internship/internship.service';
import { UsersService } from '../user/users.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationType } from '../common/enums/application-type.enum';
import { User, UserRole } from '../user/entities/user.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    private readonly resumeService: ResumeService,

    private readonly internshipService: InternshipService,

    private readonly userService: UsersService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async createApplication(
    dto: CreateApplicationDto,
    studentId: number,
  ): Promise<Application> {
    const student = await this.userService.findOne(studentId);

    const internship =
      await this.internshipService.getInternshipById(
        dto.internshipId,
      );

    if (!internship) {
      throw new NotFoundException(
        `Internship with id ${dto.internshipId} not found`,
      );
    }

    if (!internship.isActive) {
      throw new BadRequestException(
        'This internship is not Active Right Now!',
      );
    }

    const resume = await this.resumeService.getResumeById(
      dto.resumeId,
    );

    if (!resume) {
      throw new NotFoundException(
        `Resume with id ${dto.resumeId} not found`,
      );
    }

    if (
      Number(resume.student?.id) !==
      Number(studentId)
    ) {
      throw new ForbiddenException(
        'This is not your Resume!',
      );
    }

    const existingApplication =
      await this.applicationRepo.findOne({
        where: {
          student: {
            id: studentId,
          },
          internship: {
            id: dto.internshipId,
          },
        },
      });

    if (existingApplication) {
      throw new BadRequestException(
        'You have already applied in this internship circular!',
      );
    }

    let referredBy: User | null = null;

    if (dto.type === ApplicationType.REFERRAL) {
      if (!dto.referredById) {
        throw new BadRequestException(
          'Referral application-এ Alumni id দিতে হবে!',
        );
      }

      referredBy = await this.userService.findOne(
        dto.referredById,
      );

      if (referredBy.role !== UserRole.ALUMNI) {
        throw new BadRequestException(
          'Referrer must be an Alumni',
        );
      }
    }

    if (
      dto.type === ApplicationType.DIRECT &&
      dto.referredById
    ) {
      throw new BadRequestException(
        'Direct application Will not contain Referrel ID',
      );
    }

    const application = this.applicationRepo.create({
      student,
      internship,
      resume,
      referredBy,
      type: dto.type,
      status: ApplicationStatus.PENDING,
    });

    return await this.applicationRepo.save(application);
  }

  async findAllApplications(): Promise<Application[]> {
    return await this.applicationRepo.find({
      relations: {
        student: true,
        internship: true,
        resume: true,
        referredBy: true,
      },
    });
  }





  async findCompanyApplications(
    user: User,
    filters?: {
      search?: string;
      status?: string;
      internshipId?: number | string;
      page?: number;
      limit?: number;
    },
  ) {
    const currentUser = await this.userRepo.findOne({
      where: {
        id: user.id,
      },
      relations: {
        company: true,
      },
    });

    if (!currentUser || !currentUser.company) {
      throw new NotFoundException('Company not found.');
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 5;

    const query = this.applicationRepo
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.student', 'student')
      .leftJoinAndSelect('application.internship', 'internship')
      .leftJoinAndSelect('application.referredBy', 'referredBy')
      .leftJoinAndSelect('application.resume', 'resume')
      .where('internship.companyId = :companyId', {
        companyId: currentUser.company.id,
      });

    // Status filter
    if (filters?.status && filters.status !== 'All') {
      query.andWhere(
        'application.status = :status',
        {
          status: filters.status,
        },
      );
    }

    // Internship filter
    if (filters?.internshipId) {
      query.andWhere(
        'internship.id = :internshipId',
        {
          internshipId: Number(filters.internshipId),
        },
      );
    }

    // Search
    if (filters?.search && filters.search.trim() !== '') {
      query.andWhere(
        `(LOWER(student.firstName) LIKE LOWER(:search)
        OR LOWER(student.email) LIKE LOWER(:search)
        OR LOWER(internship.title) LIKE LOWER(:search))`,
        {
          search: `%${filters.search.trim()}%`,
        },
      );
    }

    // Pagination
    const [data, total] = await query
      .orderBy('application.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }








  async findById(id: number): Promise<Application> {
    const application =
      await this.applicationRepo.findOne({
        where: {
          id,
        },
        relations: {
          student: true,
          internship: true,
          resume: true,
          referredBy: true,
          interviews: true,
        },
      });

    if (!application) {
      throw new NotFoundException(
        `Application with ${id} not found`,
      );
    }

    return application;
  }

  async updateStatus(
    dto: UpdateApplicationDto,
    id: number,
  ): Promise<Application> {
    const application = await this.findById(id);

    // Case-insensitive Enum matching
    const inputStatus = String(dto.status).toLowerCase();
    const matchedStatus = Object.values(ApplicationStatus).find(
      (val) => val.toLowerCase() === inputStatus,
    );

    if (!matchedStatus) {
      throw new BadRequestException(
        `Invalid status: ${dto.status}. Valid statuses are: ${Object.values(ApplicationStatus).join(', ')}`,
      );
    }

    application.status = matchedStatus;

    return await this.applicationRepo.save(application);
  }

  async removeApplication(
    id: number,
    studentId: number,
  ): Promise<{ message: string }> {
    const application = await this.findById(id);

    if (application.student.id !== studentId) {
      throw new ForbiddenException(
        'You can not delete this application',
      );
    }

    if (
      String(application.status).toLowerCase() !==
      ApplicationStatus.PENDING.toLowerCase()
    ) {
      throw new BadRequestException(
        'Only Pending Application Can Withdrow!',
      );
    }

    await this.applicationRepo.delete(id);

    return {
      message: `Application ${id} withdrawn successfully`,
    };
  }


}
