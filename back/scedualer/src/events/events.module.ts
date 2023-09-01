import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { PrismaClient } from '@prisma/client';


@Module({
  providers: [EventsGateway,PrismaClient],
  exports:[EventsGateway],
})
export class EventsModule {}
