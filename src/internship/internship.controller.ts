import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InternshipService } from './internship.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { Internship } from './entities/internship.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('internship')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  createInternship(@Body() createInternshipDto: CreateInternshipDto): Promise<Internship> {
    return this.internshipService.createInternship(createInternshipDto);
  }

  @Get()
  getAllInternships(): Promise<Internship[]> {
    return this.internshipService.getAllInternships();
  }

  @Get(':id')
  getInternshipById(@Param('id', ParseIntPipe) id: number): Promise<Internship | null> {
    return this.internshipService.getInternshipById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  updateInternship(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateInternshipDto: UpdateInternshipDto
  ): Promise<Internship> {
    return this.internshipService.updateInternship(id, updateInternshipDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HR, UserRole.ADMIN)
  deleteInternship(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.internshipService.deleteInternship(id);
  }
}