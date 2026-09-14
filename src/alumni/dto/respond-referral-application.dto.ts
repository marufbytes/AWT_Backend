import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReferralApplicationStatus } from '../enums/referral-application-status.enum';

export class RespondReferralApplicationDto {
  @IsEnum(ReferralApplicationStatus)
  @IsIn([
    ReferralApplicationStatus.ACCEPTED,
    ReferralApplicationStatus.REJECTED,
  ])
  @IsNotEmpty()
  status!:
    ReferralApplicationStatus.ACCEPTED | ReferralApplicationStatus.REJECTED;

  @IsString()
  @IsOptional()
  responseMessage?: string;
}
