import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview } from './interview.entity';
import { Application } from '../application/entities/application.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { InterviewStatus } from '../common/enums/InterviewStatus.enum';
import { CompleteInterviewDto } from './dto/complete-interview.dto';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,

    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) { }

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    const application = await this.applicationRepository.findOneBy({
      id: createInterviewDto.applicationId,
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${createInterviewDto.applicationId} not found`,
      );
    }

    const interview = this.interviewRepository.create({
      applicationId: application.id,
      scheduledDate: new Date(createInterviewDto.scheduledDate),
      meetingLink: createInterviewDto.meetingLink,
      status: InterviewStatus.SCHEDULED,
    });

    const savedInterview = await this.interviewRepository.save(interview);

    application.status = ApplicationStatus.INTERVIEW;
    await this.applicationRepository.save(application);

    return savedInterview;
  }

  async findAll(status?: string) {
    let targetStatus: InterviewStatus | null = null;

    if (status && status.toLowerCase() !== 'all') {
      const rawStatus = status.toLowerCase();
      if (rawStatus === 'upcoming' || rawStatus === 'scheduled') {
        targetStatus = InterviewStatus.SCHEDULED;
      } else if (rawStatus === 'completed') {
        targetStatus = InterviewStatus.COMPLETED;
      } else if (rawStatus === 'cancelled') {
        targetStatus = InterviewStatus.CANCELLED;
      }
    }

    const interviews = await this.interviewRepository.find({
      where: targetStatus ? { status: targetStatus } : {},
      relations: {
        application: {
          student: true,
          internship: true,
        },
      },
    });

    return interviews.map((interview) => ({
      id: interview.id,
      scheduledDate: interview.scheduledDate,
      meetingLink: interview.meetingLink,
      status: interview.status,
      candidateName:
        `${interview.application?.student?.firstName ?? ''} ${interview.application?.student?.lastName ?? ''}`.trim()
        || `Candidate #${interview.id}`,
      internshipTitle:
        interview.application?.internship?.title
        || 'N/A',
      applicationId: interview.applicationId,
    }));
  }

  async findOne(id: number): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: {
        application: {
          student: true,
          internship: true,
        },
      },
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async update(
    id: number,
    updateInterviewDto: UpdateInterviewDto,
  ): Promise<Interview> {
    await this.findOne(id);

    const { scheduledDate, ...updateData } = updateInterviewDto;

    await this.interviewRepository.update(id, {
      ...updateData,
      ...(scheduledDate && {
        scheduledDate: new Date(scheduledDate),
      }),
    });

    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.interviewRepository.delete(id);
  }

  async complete(
    id: number,
    completeInterviewDto: CompleteInterviewDto,
  ): Promise<Interview> {
    const interview = await this.findOne(id);

    if (interview.status !== InterviewStatus.SCHEDULED) {
      throw new BadRequestException(
        'Only scheduled interviews can be completed',
      );
    }

    const decisionLower = completeInterviewDto.decision?.toLowerCase() as ApplicationStatus;

    if (
      decisionLower !== ApplicationStatus.ACCEPTED &&
      decisionLower !== ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Decision must be ACCEPTED or REJECTED',
      );
    }

    const application = await this.applicationRepository.findOneBy({
      id: interview.applicationId,
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${interview.applicationId} not found`,
      );
    }

    interview.status = InterviewStatus.COMPLETED;
    await this.interviewRepository.save(interview);

    application.status = decisionLower;
    await this.applicationRepository.save(application);

    return await this.findOne(id);
  }
}
