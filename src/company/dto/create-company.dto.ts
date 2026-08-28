import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCompanyDto {

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    industry: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;
}
