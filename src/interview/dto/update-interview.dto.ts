import { PartialType } from '@nestjs/mapped-types';
import { CreateInterviewDto } from './create-interview.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InterviewStatus } from '../../common/enums/InterviewStatus.enum';

export class UpdateInterviewDto extends PartialType(CreateInterviewDto) {
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

}