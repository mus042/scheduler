import { Module } from '@nestjs/common';
import { UserRequestController } from './user-request.controller';
import { UserRequestService } from './user-request.service';

@Module({
  controllers: [UserRequestController],
  providers: [UserRequestService],
    exports:[UserRequestService],
})
export class UserRequestModule {}
