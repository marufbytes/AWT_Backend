import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview } from './interview.entity';
import { Application } from '../application/entities/application.entity';

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

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
      ...createInterviewDto,
      scheduledDate: new Date(createInterviewDto.scheduledDate),
    });
    return await this.interviewRepository.save(interview);
  }

  async findAll(): Promise<Interview[]> {
    return await this.interviewRepository.find({ relations: { application: true } });
  }

  async findOne(id: number): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: { application: true },
    });
    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }
    return interview;
  }

  async update(id: number, updateInterviewDto: UpdateInterviewDto): Promise<Interview> {
    await this.findOne(id);
    const { scheduledDate, ...updateData } = updateInterviewDto;
    await this.interviewRepository.update(id, {
      ...updateData,
      ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
    });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.interviewRepository.delete(id);
  }
}
