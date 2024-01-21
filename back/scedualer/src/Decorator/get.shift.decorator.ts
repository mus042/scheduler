import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetShifts = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.shift[data];
    }
    return request.shift;
  },
);
