import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume) private readonly resumeRepo: Repository<Resume>,
  ) {}

  async createResume(
    createResumeDto: CreateResumeDto,
    file: Express.Multer.File,
  ): Promise<Resume> {
    
    let parsedSkills = createResumeDto.skills;
    if (typeof parsedSkills === 'string') {
      parsedSkills = (parsedSkills as string).split(',').map(skill => skill.trim());
    }

    const resume = this.resumeRepo.create({
      title: createResumeDto.title,
      skills: parsedSkills,
      fileUrl: file.path,
      student: { id: createResumeDto.studentId },
    });

    return await this.resumeRepo.save(resume);
  }

  async getAllResumes(): Promise<Resume[]> {
    return await this.resumeRepo.find({
      relations: { student: true },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        skills: true,
        student: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
        }
      },
    });
  }

  async getResumeById(id: number): Promise<Resume | null> {
    const resume = await this.resumeRepo.findOne({
      where: {
        id: id,
      },
      relations: { student: true },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        skills: true,
        student: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
        }
      },
    });

    return resume;
  }

  async updateResume(id: number, updateResumeDto: UpdateResumeDto): Promise<Resume> {
    const resume = await this.getResumeById(id);
    if (resume != null) {
      Object.assign(resume, updateResumeDto);
      return await this.resumeRepo.save(resume);
    } else {
      throw new BadRequestException('resume not Found');
    }
  }

  async deleteResume(id: number): Promise<string> {
    const result = await this.resumeRepo.delete(id);

    if (result.affected == 0) {
      return `resume not found`;
    }
    return `resume deleted with id ${id}`;
  }
}