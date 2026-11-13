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


  @Get('my')
  @Roles(UserRole.STUDENT)
  findMyApplications(@GetUser() user: User) {
    return this.applicationService.findStudentApplications(user.id);
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
  @Roles(UserRole.STUDENT, UserRole.ALUMNI, UserRole.HR, UserRole.ADMIN)
  findAllApplications(@GetUser() user: User) {

    return this.applicationService.findAllApplications(user);

  }



  @Get(':id')
  @Roles(UserRole.STUDENT, UserRole.ALUMNI, UserRole.HR, UserRole.ADMIN)
  findById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.applicationService.findByIdForUser(id, user);
  }


  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.HR)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationDto,
    @GetUser() user: User
  ) {
    return this.applicationService.updateStatus(dto, id, user);
  }



  @Delete(':id')
  @Roles(UserRole.STUDENT, UserRole.ADMIN)
  deleteApplication(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ) {
    if (user.role === UserRole.ADMIN) {
      return this.applicationService.adminRemoveApplication(id);
    }
    return this.applicationService.removeApplication(id, user.id)
  }

}

