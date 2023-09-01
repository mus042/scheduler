import { shift } from '@prisma/client';

export class UpdateStatsDto {
  id?: number;
  scheduleId?: number;
  userId: number;
  morningShifts?: number;
  noonShift?: number;
  nightShifts?: number;
  overTimerStep1?:number;
  overTimeStep2?:number;
  restDayHours?:number;
}
