import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }


  @Post()
  create(@Body() dto: CreateCompanyDto) {

    return this.companyService.createCompany(dto);

  }

  @Get()
  findAllCompany(
    @Query('companyName') companyName?: string,
    @Query('industry') industry?: string,
    @Query('isVerified') isVerified?: string,
  ) {
    return this.companyService.findAllCompany(companyName, industry, isVerified);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, dto);
  }

  @Patch(':id/verify')
  verify(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.verify(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.remove(id);
  }


  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.restoreCompany(id);
  }


}
