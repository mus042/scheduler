import { Module } from '@nestjs/common';
import { ShiftController } from './shift.controller';
import { ShiftService } from './shift.services';

@Module({
  controllers: [ShiftController],
  providers: [ShiftService],
  exports: [ShiftService],
})
export class ShiftModule {}
