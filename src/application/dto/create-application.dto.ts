import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive } from "class-validator";
import { ApplicationType } from "../../common/enums/application-type.enum";

export class CreateApplicationDto {

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  internshipId:number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  resumeId:number;

  @IsEnum(ApplicationType)
  @IsNotEmpty()
  type:ApplicationType;

  @IsInt()
  @IsPositive()
  @IsOptional()
  referredById?: number;
  
}
