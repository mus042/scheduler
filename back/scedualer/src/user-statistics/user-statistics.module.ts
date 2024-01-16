import { Module } from '@nestjs/common';
import { UserStatisticsController } from './user-statistics.controller';
import { UserStatisticsService } from './user-statistics.service';

@Module({
  controllers: [UserStatisticsController],
  providers: [UserStatisticsService],
exports:[UserStatisticsService]
})
export class UserStatisticsModule {}
