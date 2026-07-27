import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { ApplicationStatus } from "../../common/enums/application-status.enum";


export class UpdateApplicationDto{

    @IsEnum(ApplicationStatus)
    @IsNotEmpty()
    status:ApplicationStatus

}
