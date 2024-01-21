import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAllUsers = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request.user[data]);
    return request.user[data];
  },
);
