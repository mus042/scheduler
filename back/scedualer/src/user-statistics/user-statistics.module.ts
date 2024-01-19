import { Module } from '@nestjs/common';
import { UserStatisticsController } from './user-statistics.controller';
import { UserStatisticsService } from './user-statistics.service';
import { ShiftService } from 'src/shift/shift.services';

@Module({
  controllers: [UserStatisticsController],
  providers: [UserStatisticsService,ShiftService],
exports:[UserStatisticsService]
})
export class UserStatisticsModule {}
