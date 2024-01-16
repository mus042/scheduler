import { user } from '@prisma/client';

export class UsershiftStats {
  id?: number;
  scheduleId: number;
  userId: number;
  morningShifts?: number;
  noonShifts?: number;
  nightShifts?: number;
}
