import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsInt, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  password?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2200)
  gradYear?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsInt()
  companyId?: number;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  currentCompany?: string;
}
