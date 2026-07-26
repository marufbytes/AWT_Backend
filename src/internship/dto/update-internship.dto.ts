import { PartialType } from '@nestjs/mapped-types';
import { CreateInternshipDto } from './create-internship.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateInternshipDto extends PartialType(CreateInternshipDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}