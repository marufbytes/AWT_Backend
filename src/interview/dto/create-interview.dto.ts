import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInterviewDto {
  @IsInt()
  @IsNotEmpty()
  applicationId: number;

  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  meetingLink?: string;

 /* @IsString()
  @IsOptional()
  status?: string;*/
}
