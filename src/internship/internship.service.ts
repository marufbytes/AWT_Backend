import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from './entities/internship.entity';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';

@Injectable()
export class InternshipService {
  constructor(
    @InjectRepository(Internship) private readonly internshipRepo: Repository<Internship>,
  ) {}

  async createInternship(createInternshipDto: CreateInternshipDto): Promise<Internship> {
    const internship = this.internshipRepo.create(createInternshipDto);
    return await this.internshipRepo.save(internship);
  }

  async getAllInternships(): Promise<Internship[]> {
    return await this.internshipRepo.find({
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        isActive: true,
      },
    });
  }

  async getInternshipById(id: number): Promise<Internship | null> {
    const internship = await this.internshipRepo.findOne({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        isActive: true,
      },
    });

    return internship;
  }

  async updateInternship(id: number, updateInternshipDto: UpdateInternshipDto): Promise<Internship> {
    const internship = await this.getInternshipById(id);
    if (internship != null) {
      Object.assign(internship, updateInternshipDto);
      return await this.internshipRepo.save(internship);
    } else {
      throw new BadRequestException('internship not Found');
    }
  }

  async deleteInternship(id: number): Promise<string> {
    const result = await this.internshipRepo.delete(id);

    if (result.affected == 0) {
      return `internship not found`;
    }
    return `internship deleted with id ${id}`;
  }
}
