import { Module } from '@nestjs/common';
import { SchedulerController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ShiftModule } from '../shift/shift.module';
import { UserModule } from '../user/user.module';
import { ScheduleUtil } from './schedule.utilsClass';

@Module({
    imports:[ShiftModule,UserModule],
    controllers: [SchedulerController],
    providers: [ScheduleService,ScheduleUtil]
})
export class ScheduleModule {}
