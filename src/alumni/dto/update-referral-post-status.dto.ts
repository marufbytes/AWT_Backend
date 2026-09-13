import { IsEnum, IsIn, IsNotEmpty } from 'class-validator';
import { ReferralPostStatus } from '../enums/referral-post-status.enum';

// What an admin can turn a PENDING referral post into.
export class UpdateReferralPostStatusDto {
  @IsEnum(ReferralPostStatus)
  @IsIn([ReferralPostStatus.APPROVED, ReferralPostStatus.REJECTED])
  @IsNotEmpty()
  status!: ReferralPostStatus.APPROVED | ReferralPostStatus.REJECTED;
}
