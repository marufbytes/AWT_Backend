import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewService } from './interview.service';
import { Interview } from './interview.entity';
import { InterviewController } from './interview.controller';
import { Application } from '../application/entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Interview, Application])],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewsModule {}
