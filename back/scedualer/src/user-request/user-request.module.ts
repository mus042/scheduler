import { Module } from '@nestjs/common';
import { UserRequestController } from './user-request.controller';
import { UserRequestService } from './user-request.service';
import { EventsModule } from '../events/events.module';
import { EventsGateway } from '../events/events.gateway';

@Module({
  imports: [EventsModule],
  controllers: [UserRequestController],
  providers: [UserRequestService],
  
})
export class UserRequestModule {}
