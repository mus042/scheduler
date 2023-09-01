import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Assuming the user role is stored in the request object (e.g., after authentication)
    return request.userRole; // Replace 'userRole' with the actual property name holding the role
  },
);
