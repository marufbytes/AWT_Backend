import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export class CompleteInterviewDto {
  @IsEnum(ApplicationStatus)
  @IsNotEmpty()
  decision: ApplicationStatus;
}
