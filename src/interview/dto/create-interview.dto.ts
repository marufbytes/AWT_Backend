import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateInterviewDto {
    
  @IsInt()
  @IsNotEmpty()
  applicationId: number;

  @IsString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsString()
  @IsNotEmpty()
  meetingLink: string;
}