import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Resume } from '../resume/entities/resume.entity';
import { ReferralPost } from './entities/referral-post.entity';
import { ReferralApplication } from './entities/referral-application.entity';
import { ReferralPostStatus } from './enums/referral-post-status.enum';
import { ReferralApplicationStatus } from './enums/referral-application-status.enum';
import { CreateReferralPostDto } from './dto/create-referral-post.dto';
import { UpdateReferralPostStatusDto } from './dto/update-referral-post-status.dto';
import { RespondReferralApplicationDto } from './dto/respond-referral-application.dto';

const POST_RELATIONS = { alumni: true, suggestedStudents: true } as const;
const APPLICATION_RELATIONS = {
  student: true,
  referralPost: { alumni: true },
} as const;

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(ReferralPost)
    private readonly referralPostRepo: Repository<ReferralPost>,
    @InjectRepository(ReferralApplication)
    private readonly referralApplicationRepo: Repository<ReferralApplication>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Resume)
    private readonly resumeRepo: Repository<Resume>,
  ) {}

  // Referral posts

  async createReferralPost(
    alumniId: number,
    dto: CreateReferralPostDto,
  ): Promise<ReferralPost> {
    let suggestedStudents: User[] = [];

    if (dto.suggestedStudentIds?.length) {
      suggestedStudents = await this.userRepo.find({
        where: { id: In(dto.suggestedStudentIds), role: UserRole.STUDENT },
      });

      if (suggestedStudents.length !== dto.suggestedStudentIds.length) {
        throw new BadRequestException(
          'One or more suggested students could not be found',
        );
      }
    }

    const post = this.referralPostRepo.create({
      title: dto.title,
      companyName: dto.companyName,
      location: dto.location,
      description: dto.description,
      requiredSkills: dto.requiredSkills,
      vacancies: dto.vacancies,
      deadline: dto.deadline,
      status: ReferralPostStatus.PENDING,
      alumni: { id: alumniId },
      suggestedStudents,
    });

    return await this.referralPostRepo.save(post);
  }

  // Posts created by one alumni, newest first.
  async getMyReferralPosts(alumniId: number): Promise<ReferralPost[]> {
    return await this.referralPostRepo.find({
      where: { alumni: { id: alumniId } },
      relations: POST_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  // Posts every student is allowed to see and apply to.
  async getApprovedReferralPosts(): Promise<ReferralPost[]> {
    return await this.referralPostRepo.find({
      where: { status: ReferralPostStatus.APPROVED },
      relations: POST_RELATIONS,
      order: { createdAt: 'DESC' },
    });
  }

  // Posts still awaiting an admin's decision.
  async getPendingReferralPosts(): Promise<ReferralPost[]> {
    return await this.referralPostRepo.find({
      where: { status: ReferralPostStatus.PENDING },
      relations: POST_RELATIONS,
      order: { createdAt: 'ASC' },
    });
  }

  async getReferralPostById(id: number): Promise<ReferralPost> {
    const post = await this.referralPostRepo.findOne({
      where: { id },
      relations: POST_RELATIONS,
    });

    if (!post) {
      throw new NotFoundException(`Referral post with id ${id} not found`);
    }

    return post;
  }

  // Admin approves or rejects a post that is currently PENDING.
  async updateReferralPostStatus(
    id: number,
    dto: UpdateReferralPostStatusDto,
  ): Promise<ReferralPost> {
    const post = await this.getReferralPostById(id);

    if (post.status !== ReferralPostStatus.PENDING) {
      throw new BadRequestException(
        'Only a pending referral post can be approved or rejected',
      );
    }

    post.status = dto.status;
    return await this.referralPostRepo.save(post);
  }

  // Students
  // Students who have never had an application accepted through any
  // alumni referral post, joined with their latest resume (if any).
  async getUnplacedStudents(): Promise<
    Array<{
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      skills: string[];
      applicationCount: number;
      resumeUrl: string | null;
    }>
  > {
    const allApplications = await this.referralApplicationRepo.find({
      relations: { student: true },
    });

    const placedIds = new Set(
      allApplications
        .filter((a) => a.status === ReferralApplicationStatus.ACCEPTED)
        .map((a) => a.student.id),
    );

    const countByStudent = new Map<number, number>();
    for (const application of allApplications) {
      const studentId = application.student.id;
      countByStudent.set(studentId, (countByStudent.get(studentId) ?? 0) + 1);
    }

    const students = await this.userRepo.find({
      where: { role: UserRole.STUDENT },
    });

    const unplaced = students.filter((s) => !placedIds.has(s.id));

    const resumes = await this.resumeRepo.find({
      relations: { student: true },
      order: { updateDate: 'DESC' },
    });

    const resumeByStudent = new Map<number, Resume>();
    for (const resume of resumes) {
      if (!resumeByStudent.has(resume.student.id)) {
        resumeByStudent.set(resume.student.id, resume);
      }
    }

    return unplaced.map((student) => {
      const resume = resumeByStudent.get(student.id);
      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        skills: resume?.skills ?? [],
        applicationCount: countByStudent.get(student.id) ?? 0,
        resumeUrl: resume?.fileUrl ?? null,
      };
    });
  }

  // Applications

  // A student applies to one of the APPROVED referral posts.
  async applyToReferralPost(
    postId: number,
    studentId: number,
  ): Promise<ReferralApplication> {
    const post = await this.getReferralPostById(postId);

    if (post.status !== ReferralPostStatus.APPROVED) {
      throw new BadRequestException(
        'You can only apply to an approved referral post',
      );
    }

    const existing = await this.referralApplicationRepo.findOne({
      where: { student: { id: studentId }, referralPost: { id: postId } },
    });

    if (existing) {
      throw new BadRequestException(
        'You have already applied to this referral post',
      );
    }

    const application = this.referralApplicationRepo.create({
      student: { id: studentId },
      referralPost: { id: postId },
      status: ReferralApplicationStatus.PENDING,
    });

    return await this.referralApplicationRepo.save(application);
  }

  // Every application submitted to one alumni's posts, newest first.
  async getApplicationsForAlumni(
    alumniId: number,
  ): Promise<ReferralApplication[]> {
    return await this.referralApplicationRepo.find({
      where: { referralPost: { alumni: { id: alumniId } } },
      relations: APPLICATION_RELATIONS,
      order: { appliedAt: 'DESC' },
    });
  }

  // A student's own applications, newest first.
  async getApplicationsForStudent(
    studentId: number,
  ): Promise<ReferralApplication[]> {
    return await this.referralApplicationRepo.find({
      where: { student: { id: studentId } },
      relations: APPLICATION_RELATIONS,
      order: { appliedAt: 'DESC' },
    });
  }

  // How many students the alumni has accepted across all of their posts.
  async getAcceptedApplicationCount(alumniId: number): Promise<number> {
    return await this.referralApplicationRepo.count({
      where: {
        status: ReferralApplicationStatus.ACCEPTED,
        referralPost: { alumni: { id: alumniId } },
      },
    });
  }

  // Accept or reject a student's application. Accepting is refused once the
  // post's vacancies are already filled.
  async respondToApplication(
    applicationId: number,
    alumniId: number,
    dto: RespondReferralApplicationDto,
  ): Promise<ReferralApplication> {
    const application = await this.referralApplicationRepo.findOne({
      where: { id: applicationId },
      relations: APPLICATION_RELATIONS,
    });

    if (!application) {
      throw new NotFoundException(
        `Application with id ${applicationId} not found`,
      );
    }

    if (application.referralPost.alumni.id !== alumniId) {
      throw new ForbiddenException(
        'You can only respond to applications on your own referral posts',
      );
    }

    if (dto.status === ReferralApplicationStatus.ACCEPTED) {
      const acceptedCount = await this.referralApplicationRepo.count({
        where: {
          status: ReferralApplicationStatus.ACCEPTED,
          referralPost: { id: application.referralPost.id },
        },
      });

      if (acceptedCount >= application.referralPost.vacancies) {
        throw new BadRequestException(
          'Cannot accept more students — this vacancy is already full',
        );
      }
    }

    application.status = dto.status;
    application.responseMessage = dto.responseMessage ?? null;
    application.respondedAt = new Date();

    return await this.referralApplicationRepo.save(application);
  }
}
