import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { Interview } from './interview.entity';

@Injectable()
export class InterviewsService {
    constructor(
        @InjectRepository(Interview)
        private readonly interviewRepo: Repository<Interview>,
    ) { }

    async create(createInterviewDto: CreateInterviewDto) {
        const interview = this.interviewRepo.create({
            scheduledDate: new Date(createInterviewDto.scheduledDate),
            meetingLink: createInterviewDto.meetingLink,
            application: { id: createInterviewDto.applicationId },
        });
        return await this.interviewRepo.save(interview);
    }

    async findAll() {
        return await this.interviewRepo.find({
            relations: { application: true },
        });
    }

    async findOne(id: number) {
        const interview = await this.interviewRepo.findOne({
            where: { id },
            relations: { application: true },
        });
        if (!interview) {
            throw new NotFoundException(`Interview with ID ${id} not found`);
        }
        return interview;
    }

    async update(id: number, updateInterviewDto: UpdateInterviewDto) {
        await this.findOne(id);
        return await this.interviewRepo.update(id, updateInterviewDto);
    }

    async remove(id: number) {
        await this.findOne(id);
        return await this.interviewRepo.delete(id);
    }
}