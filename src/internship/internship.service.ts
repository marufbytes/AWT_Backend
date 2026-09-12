import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Internship } from './entities/internship.entity';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class InternshipService {
  constructor(
    @InjectRepository(Internship) private readonly internshipRepo: Repository<Internship>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async createInternship(
    dto: CreateInternshipDto,
    user: User,
  ): Promise<Internship> {
    const currentUser = await this.userRepo.findOne({
      where: {
        id: user.id,
      },
      relations: {
        company: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.role === UserRole.HR) {
      if (!currentUser.company) {
        throw new BadRequestException(
          'HR is not associated with any company',
        );
      }

      const internship = this.internshipRepo.create({
        ...dto,
        company: currentUser.company,
      });

      return await this.internshipRepo.save(internship);
    }

    const internship = this.internshipRepo.create(dto);

    return await this.internshipRepo.save(internship);
  }

  async getAllInternships(): Promise<Internship[]> {
    return await this.internshipRepo.find({
      relations: { company: true },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        isActive: true,
        company: {
          id: true,
          name: true,
        },
      },
    });
  }


  async getInternshipById(id: number): Promise<any> {
    const internship = await this.internshipRepo.findOne({
      where: { id },
      relations: {
        company: true,
        applications: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        isActive: true,
        company: {
          id: true,
          name: true,
        },
        applications: {
          id: true,
          status: true,
        },
      },
    });

    if (!internship) {
      return null;
    }

    const apps = internship.applications || [];

    const stats = {
      total: apps.length,

      pending: apps.filter(
        (a: any) => a.status?.toLowerCase() === 'pending',
      ).length,

      reviewed: apps.filter(
        (a: any) => a.status?.toLowerCase() === 'reviewed',
      ).length,

      interview: apps.filter(
        (a: any) => a.status?.toLowerCase() === 'interview',
      ).length,

      accepted: apps.filter(
        (a: any) => a.status?.toLowerCase() === 'accepted',
      ).length,

      rejected: apps.filter(
        (a: any) => a.status?.toLowerCase() === 'rejected',
      ).length,
    };

    const { applications, ...rest } = internship;

    return {
      ...rest,
      stats,
    };
  }




  async updateInternship(id: number, updateInternshipDto: UpdateInternshipDto): Promise<Internship> {
    const internship = await this.internshipRepo.findOne({ where: { id } });
    if (internship != null) {
      Object.assign(internship, updateInternshipDto);
      return await this.internshipRepo.save(internship);
    } else {
      throw new BadRequestException('internship not Found');
    }
  }



  async toggleInternshipStatus(id: number): Promise<{ message: string; isActive: boolean }> {
    const internship = await this.internshipRepo.findOne({ where: { id } });

    if (!internship) {
      throw new BadRequestException(`Internship with id ${id} not found`);
    }

    internship.isActive = !internship.isActive;
    await this.internshipRepo.save(internship);

    return {
      message: `Internship ${internship.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: internship.isActive,
    };
  }



  async deleteInternship(id: number): Promise<string> {
    const result = await this.internshipRepo.delete(id);

    if (result.affected == 0) {
      return `internship not found`;
    }
    return `internship deleted with id ${id}`;
  }



  async getInternshipsByCompany(user: User): Promise<Internship[]> {
    const currentUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: { company: true },
    });

    if (!currentUser || !currentUser.company) {
      return [];
    }

    return await this.internshipRepo.find({
      where: {
        company: { id: currentUser.company.id }
      },
      relations: { company: true },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        isActive: true,
        company: {
          id: true,
          name: true,
        },
      },
    });
  }
}
