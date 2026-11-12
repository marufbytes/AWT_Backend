import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.trim() !== '') {
      if (value.includes(',')) {
        return value.split(',').map((skill) => skill.trim()).filter(Boolean);
      }
      return value.split(/\s+/).map((skill) => skill.trim()).filter(Boolean);
    }
    return value;
  })
  skills?: string[];


  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  studentId: number;
}
