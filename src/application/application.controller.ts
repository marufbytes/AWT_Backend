import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) { }

  @Post()
  @Roles(UserRole.STUDENT)
  createApplication(
    @Body() dto: CreateApplicationDto,
    @GetUser() user: User
  ) {
    return this.applicationService.createApplication(dto, user.id);
  }



  @Get('company')
  @Roles(UserRole.HR, UserRole.ADMIN)
  findCompanyApplications(
    @GetUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('internshipId') internshipId?: string,
  ) {
    return this.applicationService.findCompanyApplications(user, {
      page: Number(page) || 1,
      limit: Number(limit) || 5,
      search,
      status,
      internshipId,
    });
  }





  @Get()
  @Roles(UserRole.HR, UserRole.ADMIN)
  findAllApplications() {

    return this.applicationService.findAllApplications();

  }



  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.findById(id);
  }


  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.HR)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto
  ) {
    return this.applicationService.updateStatus(dto, id);
  }



  @Delete(':id')
  @Roles(UserRole.STUDENT)
  deleteApplication(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ) {
    return this.applicationService.removeApplication(id, user.id)
  }

}

