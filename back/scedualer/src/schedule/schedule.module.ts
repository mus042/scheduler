import { Module } from '@nestjs/common';
import { SchedulerController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ShiftModule } from '../shift/shift.module';
import { UserModule } from '../user/user.module';
import { ScheduleUtil } from './schedule.utilsClass';
import { UserStatisticsModule } from '../user-statistics/user-statistics.module';
import { UserStatisticsService } from '../user-statistics/user-statistics.service';

@Module({
  imports: [ShiftModule, UserModule, UserStatisticsModule],
  controllers: [SchedulerController],
  providers: [ScheduleService, ScheduleUtil],
})
export class ScheduleModule {}
