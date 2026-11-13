import { IsEnum } from 'class-validator';
import { HrApprovalStatus } from '../entities/user.entity';

export class HrApprovalDto {
  @IsEnum(HrApprovalStatus, {
    message: 'status must be one of PENDING, APPROVED, REJECTED',
  })
  status: HrApprovalStatus;
}
