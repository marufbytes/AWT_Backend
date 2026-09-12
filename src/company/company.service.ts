import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }



  async createCompany(dto: CreateCompanyDto): Promise<Company> {
    const exists = await this.companyRepo.findOne({
      where: {
        name: dto.name,
      },
    });

    if (exists) {
      throw new BadRequestException(
        `Company with name ${dto.name} already exists`,
      );
    }

    const company = this.companyRepo.create(dto);

    return await this.companyRepo.save(company);
  }



  async findAllCompany(companyName?: string, industry?: string, isVerified?: string): Promise<Company[]> {

    const where: any = {};

    if (companyName) {
      where.name = ILike(`%${companyName}%`)
    }


    if (industry) {
      where.industry = ILike(`%${industry}%`);
    }

    if (isVerified === 'true' || isVerified === 'false') {
      where.isVerified = isVerified === 'true';
    }

    return await this.companyRepo.find({
      where,
      relations: {
        internships: true
      },

    });
  }


  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: {
        id: id
      },
      relations: {
        users: true,
        internships: true
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    return company;
  }



  async update(
    id: number,
    dto: UpdateCompanyDto,
    user: User,
  ): Promise<Company> {

    const company = await this.findOne(id);

    if (user.role === UserRole.HR) {

      const isMyCompany = company.users.some(
        (u) => u.id === user.id,
      );

      if (!isMyCompany) {
        throw new ForbiddenException(
          'You can only update your company!',
        );
      }
    }

    await this.companyRepo.update(id, dto);

    return this.findOne(id);
  }



  async verify(id: number): Promise<Company> {

    await this.findOne(id);
    await this.companyRepo.update(id, { isVerified: true });
    return await this.findOne(id);

  }


  async remove(id: number): Promise<{ message: string }> {
    await this.findOne(id);
    await this.companyRepo.softDelete(id);
    return {
      message: `Company with id: ${id} soft deleted successfully`
    };
  }

  async restoreCompany(id: number): Promise<Company> {

    const company = await this.companyRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }

    if (!company.deletedAt) {
      throw new BadRequestException('This Company is not deleted!');
    }

    await this.companyRepo.restore(id);
    return await this.findOne(id);

  }



  async getMyCompany(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { company: true },
    });

    if (!user?.company) {
      throw new NotFoundException('Company not found for this user');
    }

    const company = await this.companyRepo.findOne({
      where: { id: user.company.id },
      relations: {
        internships: {
          applications: {
            student: true,
          },
        },
        users: true,
      },
    });

    if (company && company.internships) {
      company.internships.forEach((internship) => {
        if (internship.applications) {
          internship.applications.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
        }
      });


    }

    return company;
  }








  async searchCompanyApplications(userId: number, query?: string) {

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { company: true },
    });

    if (!user || !user.company) {
      throw new NotFoundException('Company not found for this user');
    }

    const company = await this.companyRepo.findOne({
      where: { id: user.company.id },
      relations: {
        internships: {
          applications: {
            student: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!query || query.trim() === '') {
      return company;
    }

    const searchTerm = query.toLowerCase().trim();

    const filteredInternships = (company.internships || [])
      .map((internship) => {
        const matchedApplications = (internship.applications || []).filter((app) => {

          const studentName = `${app.student?.firstName ?? ''} ${app.student?.lastName ?? ''}`.toLowerCase();
          const studentEmail = (app.student?.email ?? '').toLowerCase();
          const roleTitle = (internship.title ?? '').toLowerCase();

          return (
            studentName.includes(searchTerm) ||
            studentEmail.includes(searchTerm) ||
            roleTitle.includes(searchTerm)
          );
        });

        return {
          ...internship,
          applications: matchedApplications,
        };
      })
      .filter((internship) => internship.applications.length > 0);

    return {
      ...company,
      internships: filteredInternships,
    };
  }




}



