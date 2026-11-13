import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { Internship } from '../internship/entities/internship.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResumeService } from '../resume/resume.service';
import { InternshipService } from '../internship/internship.service';
import { UsersService } from '../user/users.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationType } from '../common/enums/application-type.enum';
import { User, UserRole } from '../user/entities/user.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { createHash, randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service'; // আপনার প্রজেক্টের পাথ অনুযায়ী ইমপোর্ট নিশ্চিত করুন

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,

    private readonly resumeService: ResumeService,

    private readonly internshipService: InternshipService,

    private readonly userService: UsersService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly mailService: MailService, // <--- আপনার তৈরি করা MailService এখানে ইনজেক্ট করা হলো
  ) { }

  async createApplication(
    dto: CreateApplicationDto,
    studentId: number,
  ): Promise<Application> {
    const student = await this.userService.findOne(studentId);

    const internship = await this.internshipService.getInternshipById(
      dto.internshipId,
    );

    if (!internship) {
      throw new NotFoundException(
        `The selected internship circular (ID: ${dto.internshipId}) could not be found.`,
      );
    }

    if (!internship.isActive) {
      throw new BadRequestException(
        'This internship position is currently inactive and no longer accepting applications.',
      );
    }

    const resume = await this.resumeService.getResumeById(dto.resumeId);

    if (!resume) {
      throw new NotFoundException(
        `The specified resume (ID: ${dto.resumeId}) was not found in our records.`,
      );
    }

    if (Number(resume.student?.id) !== Number(studentId)) {
      throw new ForbiddenException(
        'Access denied. You can only apply using a resume that belongs to your profile.',
      );
    }

    const existingApplication = await this.applicationRepo.findOne({
      where: {
        student: { id: studentId },
        internship: { id: dto.internshipId },
      },
    });

    if (existingApplication) {
      throw new BadRequestException(
        'You have already submitted an application for this internship circular.',
      );
    }

    let referredBy: User | null = null;
    let initialStatus = ApplicationStatus.PENDING;
    let rawToken: string | null = null;
    let tokenHash: string | null = null;
    let tokenExpiresAt: Date | null = null;

    // Referral Application Logic
    if (dto.type === ApplicationType.REFERRAL) {
      const alumniEmail = (dto as any).alumniEmail;
      const referredById = dto.referredById;

      if (!alumniEmail && !referredById) {
        throw new BadRequestException(
          'Please provide a registered Alumni email address or Alumni ID to proceed with a referral application.',
        );
      }

      // Lookup Alumni by Email if provided, else fall back to ID
      if (alumniEmail) {
        referredBy = await this.userRepo.findOne({
          where: {
            email: alumniEmail.toLowerCase().trim(),
            role: UserRole.ALUMNI,
          },
        });

        if (!referredBy) {
          throw new NotFoundException(
            'No registered Alumni account was found matching the provided email address.',
          );
        }
      } else if (referredById) {
        referredBy = await this.userService.findOne(referredById);

        if (!referredBy || referredBy.role !== UserRole.ALUMNI) {
          throw new BadRequestException(
            'The selected referrer is either invalid or does not hold a registered Alumni account.',
          );
        }
      }

      // Set initial status and crypto token for alumni verification
      initialStatus = ApplicationStatus.PENDING_ALUMNI_APPROVAL;

      rawToken = randomBytes(32).toString('hex');
      tokenHash = createHash('sha256').update(rawToken).digest('hex');

      // 24 Hours Expiry
      tokenExpiresAt = new Date();
      tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24);
    }

    if (dto.type === ApplicationType.DIRECT && dto.referredById) {
      throw new BadRequestException(
        'Direct applications should not include referral details.',
      );
    }

    const application = this.applicationRepo.create({
      student,
      internship,
      resume,
      referredBy,
      type: dto.type,
      status: initialStatus,
      approvalTokenHash: tokenHash,
      approvalTokenExpiresAt: tokenExpiresAt,
    });

    const savedApp = await this.applicationRepo.save(application);

    // Send real referral verification email to Alumni via MailService
    if (dto.type === ApplicationType.REFERRAL && referredBy && rawToken) {
      try {
        await this.mailService.sendReferralVerificationEmail(
          referredBy.email,
          savedApp.id,
          rawToken,
        );
        this.logger.log(`Real verification email successfully sent to ${referredBy.email}`);
      } catch (emailErr) {
        this.logger.error(
          `Failed to deliver referral notification email to ${referredBy.email}`,
          emailErr,
        );
      }
    }

    return savedApp;
  }

  async verifyReferral(
    appId: number,
    rawToken: string,
    action: 'approve' | 'reject',
  ): Promise<Application> {
    if (!rawToken) {
      throw new BadRequestException(
        'Verification token is missing. Please use the valid link provided in your email.',
      );
    }

    const incomingTokenHash = createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const app = await this.applicationRepo.findOne({
      where: { id: appId },
      relations: {
        referredBy: true,
        student: true,
        internship: true,
      },
    });

    if (!app) {
      throw new NotFoundException(
        'Application record not found. It may have been removed or updated.',
      );
    }

    if (app.status !== ApplicationStatus.PENDING_ALUMNI_APPROVAL) {
      throw new BadRequestException(
        'This referral link has already been processed or is no longer valid for verification.',
      );
    }

    if (app.approvalTokenHash !== incomingTokenHash) {
      throw new BadRequestException(
        'Invalid or corrupted verification token.',
      );
    }

    if (
      app.approvalTokenExpiresAt &&
      new Date() > new Date(app.approvalTokenExpiresAt)
    ) {
      throw new BadRequestException(
        'This verification link has expired (validity period was 24 hours). Please ask the applicant to re-submit.',
      );
    }

    if (action === 'approve') {
      app.status = ApplicationStatus.PENDING; // Approved by Alumni -> Moves to HR review
    } else {
      app.status = ApplicationStatus.REJECTED_BY_ALUMNI;
    }

    // Invalidate token after processing
    app.approvalTokenHash = null;
    app.approvalTokenExpiresAt = null;

    return await this.applicationRepo.save(app);
  }

  private async getHrCompanyId(user: User): Promise<number | null> {
    const currentUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: { company: true },
    });
    return currentUser?.company?.id ?? null;
  }

  /**
   * Role-scoped listing:
   * ADMIN -> everything, HR -> own company's applications,
   * STUDENT / ALUMNI -> only their own applications.
   */
  async findAllApplications(user: User): Promise<Application[]> {
    const relations = {
      student: true,
      internship: { company: true },
      resume: true,
      referredBy: true,
    };

    if (user.role === UserRole.ADMIN) {
      return await this.applicationRepo.find({
        relations,
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.HR) {
      const companyId = await this.getHrCompanyId(user);
      if (companyId === null) {
        return [];
      }
      return await this.applicationRepo.find({
        where: { internship: { company: { id: companyId } } },
        relations,
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.ALUMNI) {
      return await this.applicationRepo.find({
        where: [
          { student: { id: user.id } },
          { referredBy: { id: user.id } },
        ],
        relations,
        order: { createdAt: 'DESC' },
      });
    }

    if (user.role === UserRole.STUDENT) {
      return await this.applicationRepo.find({
        where: { student: { id: user.id } },
        relations,
        order: { createdAt: 'DESC' },
      });
    }

    throw new ForbiddenException('You are not allowed to view applications');
  }

  /**
   * Reads one application only if the caller is ADMIN, owns it,
   * or is HR of the company the application belongs to.
   */
  async findByIdForUser(id: number, user: User): Promise<Application> {
    const application = await this.applicationRepo.findOne({
      where: { id },
      relations: {
        student: true,
        internship: { company: true },
        resume: true,
        referredBy: true,
        interviews: true,
      },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${id} was not found.`,
      );
    }

    if (user.role === UserRole.ADMIN) {
      return application;
    }

    if (application.student?.id === user.id) {
      return application;
    }

    if (
      user.role === UserRole.ALUMNI &&
      application.referredBy?.id === user.id
    ) {
      return application;
    }

    if (user.role === UserRole.HR) {
      const companyId = await this.getHrCompanyId(user);
      if (
        companyId !== null &&
        application.internship?.company?.id === companyId
      ) {
        return application;
      }
    }

    throw new ForbiddenException(
      'You are not allowed to view this application',
    );
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
      where: { id: user.id },
      relations: { company: true },
    });

    if (!currentUser || !currentUser.company) {
      throw new NotFoundException(
        'No associated company profile was found for your account.',
      );
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
      query.andWhere('application.status = :status', {
        status: filters.status,
      });
    }

    // Internship filter
    if (filters?.internshipId) {
      query.andWhere('internship.id = :internshipId', {
        internshipId: Number(filters.internshipId),
      });
    }

    // Search filter
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
    const application = await this.applicationRepo.findOne({
      where: { id },
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
        `Application with ID ${id} was not found.`,
      );
    }

    return application;
  }

  async updateStatus(
    dto: UpdateApplicationDto,
    id: number,
    user: User,
  ): Promise<Application> {
    const application = await this.findById(id);

    // HR can only update applications for internships of their own company.
    // ADMIN bypasses this check.
    if (user.role !== UserRole.ADMIN) {
      const [currentUser, owningInternship] = await Promise.all([
        this.userRepo.findOne({
          where: { id: user.id },
          relations: { company: true },
        }),
        this.applicationRepo.manager
          .getRepository(Internship)
          .findOne({
            where: { id: application.internship?.id },
            relations: { company: true },
          }),
      ]);

      if (
        !currentUser?.company ||
        !owningInternship?.company ||
        owningInternship.company.id !== currentUser.company.id
      ) {
        throw new ForbiddenException(
          'You can only update applications for your own company',
        );
      }
    }

    // Case-insensitive Enum matching
    const inputStatus = String(dto.status).toLowerCase();
    const matchedStatus = Object.values(ApplicationStatus).find(
      (val) => val.toLowerCase() === inputStatus,
    );

    if (!matchedStatus) {
      throw new BadRequestException(
        `Invalid status value '${dto.status}'. Allowed statuses are: ${Object.values(ApplicationStatus).join(', ')}`,
      );
    }

    application.status = matchedStatus;

    return await this.applicationRepo.save(application);
  }

  async adminRemoveApplication(id: number): Promise<{ message: string }> {
    await this.findById(id);
    await this.applicationRepo.delete(id);
    return {
      message: `Application ID ${id} has been deleted by admin.`,
    };
  }

  async removeApplication(
    id: number,
    studentId: number,
  ): Promise<{ message: string }> {
    const application = await this.findById(id);

    if (application.student.id !== studentId) {
      throw new ForbiddenException(
        'Unauthorized action. You are not allowed to delete this application.',
      );
    }

    if (
      String(application.status).toLowerCase() !==
      ApplicationStatus.PENDING.toLowerCase()
    ) {
      throw new BadRequestException(
        'Only applications with a "Pending" status can be withdrawn or deleted.',
      );
    }

    await this.applicationRepo.delete(id);

    return {
      message: `Application ID ${id} has been successfully withdrawn.`,
    };
  }

  async findStudentApplications(studentId: number): Promise<Application[]> {
    return await this.applicationRepo.find({
      where: {
        student: { id: studentId },
      },
      relations: {
        internship: { company: true },
        resume: true,
        referredBy: true,
        interviews: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}

