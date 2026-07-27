import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  createApplication(@Body() dto:CreateApplicationDto){
    const studentId=1;  //Will change When JWt Applied

    return this.applicationService.createApplication(dto,studentId);
  }

  @Get()
  findAllApplications(){

    return this.applicationService.findAllApplications();

  }

  @Get(':id')
  findById(@Param('id',ParseIntPipe) id:number){
    return this.applicationService.findById(id);
  }

  @Patch(':id')
  updateStatus(
    @Param('id',ParseIntPipe) id:number,
    @Body() dto:UpdateApplicationDto){

      return this.applicationService.updateStatus(dto,id);

  }

  @Delete(':id')
  deleteApplication(@Param('id',ParseIntPipe) id:number){
    const studentId=1; //Will change When JWt Applied
    return this.applicationService.removeApplication(id,studentId)
  }

}

