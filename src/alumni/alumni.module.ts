import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumniService } from './alumni.service';
import { AlumniController } from './alumni.controller';
import { ReferralPost } from './entities/referral-post.entity';
import { ReferralApplication } from './entities/referral-application.entity';
import { User } from '../user/entities/user.entity';
import { Resume } from '../resume/entities/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReferralPost, ReferralApplication, User, Resume]),
  ],
  controllers: [AlumniController],
  providers: [AlumniService],
  exports: [AlumniService],
})
export class AlumniModule {}
