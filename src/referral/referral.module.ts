import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { User } from '../user/entities/user.entity';
import { Internship } from '../internship/entities/internship.entity';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral, User, Internship])],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}
