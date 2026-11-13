import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min, ValidateIf } from 'class-validator';

export class CreateReferralDto {
  @IsInt()
  @Min(1)
  referrerId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  internshipId?: number;

  @ValidateIf((dto: CreateReferralDto) => !dto.internshipId)
  @IsString()
  @IsNotEmpty()
  targetRole?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
