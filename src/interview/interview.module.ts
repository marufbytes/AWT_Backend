import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { Interview } from './interview.entity';
import { InterviewController } from './interview.controller';
import { Application } from '../application/entities/application.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interview, Application,User])],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewsModule {}
