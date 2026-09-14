import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReferralPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  companyName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  location!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  requiredSkills!: string[];

  @IsInt()
  @Min(1)
  @Type(() => Number)
  vacancies!: number;

  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  suggestedStudentIds?: number[];
}
