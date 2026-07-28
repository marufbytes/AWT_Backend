import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../../user/entities/user.entity";

export const GetUser = createParamDecorator((data:string|undefined,context:ExecutionContext):User => {

    const request = context.switchToHttp().getRequest();
    return request.user;

  },
);
