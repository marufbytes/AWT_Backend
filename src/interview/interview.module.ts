import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewsService } from './interview.service';
import { Interview } from './interview.entity';
import { InterviewsController } from './interview.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interview])],
  controllers: [InterviewsController],
  providers: [InterviewsService],
})
export class InterviewsModule {}