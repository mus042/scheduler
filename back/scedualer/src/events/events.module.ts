import { Module, UseGuards } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RoleGuard } from 'src/auth/role/role.guard';
import { JwtGuard } from 'src/auth/Guard';


@Module({
  providers: [EventsGateway],
  exports:[EventsGateway],
})
export class EventsModule {}
