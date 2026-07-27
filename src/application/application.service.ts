import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }


  async createApplication(dto: CreateApplicationDto, studentId: number): Promise<Application> {

    const student = await this.userService.findOne(studentId);

    const internship = await this.internshipService.getInternshipById(dto.internshipId);

    if (!internship) {
      throw new NotFoundException(`Internship with id ${dto.internshipId} not found`);
    }

    if (!internship.isActive) {
      throw new BadRequestException('This internship is not Active Right Now!');
    }

    const resume = await this.resumeService.getResumeById(dto.resumeId);

    if (!resume) {
      throw new NotFoundException(`Resume with id ${dto.resumeId} not found`);
    }


    if (resume.student.id !== studentId) {
      throw new ForbiddenException('This is not your Resume!');
    }


    const existingApplication = await this.applicationRepo.findOne({
      where: {
        student: {
          id: studentId
        },
        internship: {
          id: dto.internshipId
        },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied in this internship circular!');
    }

    let referredBy: User | null = null;

    if (dto.type === ApplicationType.REFERRAL) {
      if (!dto.referredById) {
        throw new BadRequestException('Referral application-এ Alumni id দিতে হবে!');
      }

      referredBy = await this.userService.findOne(dto.referredById);

      if (referredBy.role !== UserRole.ALUMNI) {
        throw new BadRequestException('Referrer must be an Alumni');
      }
    }



    if (dto.type === ApplicationType.DIRECT && dto.referredById) {
      throw new BadRequestException('Direct application Will not contain Referrel ID');
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

    })

  }

  async findById(id: number): Promise<Application> {

    const application = await this.applicationRepo.findOne({
      where:{
        id
      },
      relations: {
        student: true,
        internship: true,
        resume: true,
        referredBy: true,
      }
    });

    if (!application) {
      throw new NotFoundException(`Application with ${id} not found`);
    }
    return application;


  }

  async updateStatus(dto: UpdateApplicationDto, id: number): Promise<Application> {

    const application = await this.findById(id);
    application.status = dto.status;
    return await this.applicationRepo.save(application);
  }


  async removeApplication(id: number, studentId: number): Promise<{ message: string }> {

    const application = await this.findById(id);

    if (application.student.id !== studentId) {
      throw new ForbiddenException('You can not delete this application');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException("Only Pending Application Can Withdrow!");
    }

    await this.applicationRepo.delete(id);

    return {
      message: `Application ${id} withdrawn successfully`
    }


  }


}
