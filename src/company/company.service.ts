import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>
  ) { }

  async create(dto: CreateCompanyDto): Promise<Company> {

    const exists = await this.companyRepo.findOne({
      where: {
        name: dto.name
      }
    })

    if (exists) {

      throw new BadRequestException(`Company with name ${dto.name} already exists`,);

    }

    const company = this.companyRepo.create(dto);
    return await this.companyRepo.save(company);

  }


  async findAll(): Promise<Company[]> {

    return await this.companyRepo.find({
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



  async update(id: number, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);

    if (dto.name && dto.name !== company.name) {
      const exists = await this.companyRepo.findOne({
        where: { name: dto.name },
      });

      if (exists) {
        throw new BadRequestException(`Company with name ${dto.name} already exists`);
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
    await this.companyRepo.delete(id);
    return {
      message: `Company with id ${id} deleted successfully`
    };
  }


}


