import { Controller, Post, UseInterceptors, BadRequestException, Body, UploadedFile, Get, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume } from './entities/resume.entity';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const fileName = Date.now() + '_' + file.originalname;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.originalname.match(/^.*\.(pdf)$/)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('file not satisfied the accepted types'),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  createResume(
    @Body() createResumeDto: CreateResumeDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Resume> {
    return this.resumeService.createResume(createResumeDto, file);
  }

  @Get()
  getAllResumes(): Promise<Resume[]> {
    return this.resumeService.getAllResumes();
  }

  @Get(':id')
  getResumeById(@Param('id', ParseIntPipe) id: number): Promise<Resume | null> {
    return this.resumeService.getResumeById(id);
  }

  @Patch(':id')
  updateResume(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResumeDto: UpdateResumeDto,
  ): Promise<Resume> {
    return this.resumeService.updateResume(id, updateResumeDto);
  }

  @Delete(':id')
  deleteResume(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.resumeService.deleteResume(id);
  }
}
