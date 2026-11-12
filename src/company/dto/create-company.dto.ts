import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  industry: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  location?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(30)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(11)
  phone?: string;
}
