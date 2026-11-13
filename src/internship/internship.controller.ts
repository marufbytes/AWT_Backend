import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InternshipService } from './internship.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { Internship } from './entities/internship.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../user/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('internship')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ALUMNI, UserRole.ADMIN)
  createInternship(
    @Body() createInternshipDto: CreateInternshipDto,
    @GetUser() user: User,
  ): Promise<Internship> {
    return this.internshipService.createInternship(
      createInternshipDto,
      user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.ALUMNI, UserRole.HR, UserRole.ADMIN)
  getAllInternships(): Promise<Internship[]> {
    return this.internshipService.getAllInternships();
  }

  @Get('company')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ALUMNI, UserRole.ADMIN)
  getInternshipsByCompany(@GetUser() user: User): Promise<Internship[]> {
    return this.internshipService.getInternshipsByCompany(user);
  }


  @Get(':id')
  getInternshipById(@Param('id', ParseIntPipe) id: number): Promise<Internship | null> {
    return this.internshipService.getInternshipById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ALUMNI, UserRole.ADMIN)
  updateInternship(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInternshipDto: UpdateInternshipDto,
    @GetUser() user: User,
  ): Promise<Internship> {
    return this.internshipService.updateInternship(id, updateInternshipDto, user);
  }



  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ALUMNI, UserRole.ADMIN)
  toggleInternshipStatus(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.internshipService.toggleInternshipStatus(id, user);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ALUMNI, UserRole.ADMIN)
  deleteInternship(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<string> {
    return this.internshipService.deleteInternship(id, user);
  }
}
