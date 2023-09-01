import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ShiftModule } from './shift/shift.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from './schedule/schedule.module';
import { UserRequestModule } from './user-request/user-request.module';
import { EventsModule } from './events/events.module';

import { UserStatisticsModule } from './user-statistics/user-statistics.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ShiftModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule,
    UserRequestModule,
    EventsModule,
    UserStatisticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
