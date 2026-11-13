import { IsEnum } from 'class-validator';
import { ReferralStatus } from '../entities/referral.entity';

export class UpdateReferralDto {
  @IsEnum([ReferralStatus.ACCEPTED, ReferralStatus.REJECTED])
  status: ReferralStatus.ACCEPTED | ReferralStatus.REJECTED;
}
