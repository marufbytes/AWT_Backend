import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  studentId: number; 
}