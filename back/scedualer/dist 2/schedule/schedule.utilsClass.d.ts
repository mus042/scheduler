import { ShiftDto } from '../shift/dto';
import { ShiftService } from '../shift/shift.services';
import { UserService } from '../user/user.service';
export declare class ScheduleUtil {
    private userService;
    private ShiftService;
    private userShiftCount;
    private shiftsStats;
    constructor(userService: UserService, ShiftService: ShiftService);
    getScheduleBeforForUser(): void;
    setToNextDayOfWeek(targetDayOfWeek: any): any;
    generateNewScheduleShifts(startingDate: Date, endDate: Date, scheduleId: number, schedulMold: any | undefined, type: "user" | "system"): ShiftDto[];
    getUserprefForDate(shiftDate: Date, userid: number): Promise<string>;
}
