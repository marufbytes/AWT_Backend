import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { InternshipService } from './internship.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';
import { Internship } from './entities/internship.entity';

@Controller('internship')
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  @Post()
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
  updateInternship(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateInternshipDto: UpdateInternshipDto
  ): Promise<Internship> {
    return this.internshipService.updateInternship(id, updateInternshipDto);
  }

  @Delete(':id')
  deleteInternship(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.internshipService.deleteInternship(id);
  }
}