import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../user/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) { }



  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
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


  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyCompany(@GetUser() user: User) {
    return this.companyService.getMyCompany(user.id);
  }

  @Get('my/search')
  searchCompanyApplications(
    @GetUser() user: User,
    @Query('q') query?: string,
  ) {
    return this.companyService.searchCompanyApplications(user.id, query);
  }
  


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto,
    @GetUser() user: User
  ) {
    return this.companyService.update(id, dto, user);
  }


  @Patch(':id/verify')
  @UseGuards(RolesGuard)

  @Roles(UserRole.ADMIN)
  verify(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.verify(id);
  }





  @Delete(':id')
  @UseGuards(RolesGuard)

  @Roles(UserRole.ADMIN)

  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.remove(id);
  }


  @Patch(':id/restore')
  @UseGuards(RolesGuard)

  @Roles(UserRole.ADMIN)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.companyService.restoreCompany(id);
  }




}
