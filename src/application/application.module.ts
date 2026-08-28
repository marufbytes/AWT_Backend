import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { ResumeService } from '../resume/resume.service';
import { UsersModule } from '../user/users.module';
import { InternshipModule } from '../internship/internship.module';
import { ResumeModule } from '../resume/resume.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[TypeOrmModule.forFeature([Application]),UsersModule,InternshipModule,ResumeModule,AuthModule],
  controllers: [ApplicationController],
  providers: [ApplicationService],
  exports:[ApplicationService]
})
export class ApplicationModule {}
