import { ScheduleService } from './schedule.service';
import { scheduleDto } from './dto';
import { bulkShiftsToEditDto } from '../shift/dto';
export declare class SchedulerController {
    private ScheduleService;
    constructor(ScheduleService: ScheduleService);
    setScheduleMold(scheduleMold: any, facilityId: number): Promise<boolean>;
    getSelctedScheduleMold(facilityId: any): Promise<false | ({
        scheduleTime: import("@prisma/client/runtime").GetResult<{
            id: number;
            name: string;
            startDay: number;
            startHour: number;
            startMinutes: number;
            endMinutes: number;
            endDay: number;
            endHour: number;
        }, unknown, never> & {};
        shiftsTemplate: ({
            userPrefs: ({
                role: {
                    name: string;
                    id: number;
                };
            } & import("@prisma/client/runtime").GetResult<{
                id: number;
                shiftMoldId: number;
                roleId: number;
                userCount: number;
            }, unknown, never> & {})[];
        } & import("@prisma/client/runtime").GetResult<{
            id: number;
            name: string;
            startHour: string;
            endHour: string;
            day: number;
            scheduleId: number;
        }, unknown, never> & {})[];
    } & import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string;
        daysPerSchedule: number;
        selected: boolean;
        facilityId: number;
        scheduleTimeId: number;
        restDaysId: number;
    }, unknown, never> & {})>;
    getNextScheduleUser(userId: number, facilityId: number): Promise<{
        data: {
            facilityId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            scheduleStart: Date;
            scheduleEnd: Date;
            scheduleDue: Date;
            isSelected: boolean;
            moldId: number;
        };
        shifts: import("../shift/dto").ShiftDto[];
    } | {
        data: {
            userId: number;
            facilityId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            scheduleStart: Date;
            scheduleEnd: Date;
            scheduleDue: Date;
            isLocked: boolean;
        };
        shifts: ({
            userRef: import("@prisma/client/runtime").GetResult<{
                id: number;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                hash: string;
                userServerRole: import(".prisma/client").serverRole;
                userLevel: number;
                roleId: number;
                facilityId: number;
            }, unknown, never> & {};
        } & import("@prisma/client/runtime").GetResult<{
            id: number;
            createdAt: Date;
            updatedAt: Date;
            shiftName: string;
            typeOfShift: import(".prisma/client").typeOfShift;
            shiftTimeName: import(".prisma/client").shiftTimeClassification;
            shiftStartHour: Date;
            shiftEndHour: Date;
            userId: number;
            userPreference: string;
            userRef: import("@prisma/client/runtime").GetResult<{
                id: number;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                hash: string;
                userServerRole: import(".prisma/client").serverRole;
                userLevel: number;
                roleId: number;
                facilityId: number;
            }, unknown, never> & {};
            scheduleId: number;
        }, unknown, never> & {})[];
    }>;
    getNextScheduleUserAsAdmin(userId: number, facilityId: number): Promise<{
        data: {
            facilityId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            scheduleStart: Date;
            scheduleEnd: Date;
            scheduleDue: Date;
            isSelected: boolean;
            moldId: number;
        };
        shifts: import("../shift/dto").ShiftDto[];
    } | {
        data: {
            userId: number;
            facilityId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            scheduleStart: Date;
            scheduleEnd: Date;
            scheduleDue: Date;
            isLocked: boolean;
        };
        shifts: ({
            userRef: import("@prisma/client/runtime").GetResult<{
                id: number;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                hash: string;
                userServerRole: import(".prisma/client").serverRole;
                userLevel: number;
                roleId: number;
                facilityId: number;
            }, unknown, never> & {};
        } & import("@prisma/client/runtime").GetResult<{
            id: number;
            createdAt: Date;
            updatedAt: Date;
            shiftName: string;
            typeOfShift: import(".prisma/client").typeOfShift;
            shiftTimeName: import(".prisma/client").shiftTimeClassification;
            shiftStartHour: Date;
            shiftEndHour: Date;
            userId: number;
            userPreference: string;
            userRef: import("@prisma/client/runtime").GetResult<{
                id: number;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                hash: string;
                userServerRole: import(".prisma/client").serverRole;
                userLevel: number;
                roleId: number;
                facilityId: number;
            }, unknown, never> & {};
            scheduleId: number;
        }, unknown, never> & {})[];
    }>;
    getNextScheduleSystem(facilityId: number): Promise<{
        data: {
            facilityId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            scheduleStart: Date;
            scheduleEnd: Date;
            scheduleDue: Date;
            isSelected: boolean;
            moldId: number;
        };
        shifts: any[];
    }>;
    getCurrentSchedule(facilityId: number): Promise<{
        data: {
            facilityId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            scheduleStart: Date;
            scheduleEnd: Date;
            scheduleDue: Date;
            isSelected: boolean;
            moldId: number;
        };
        shifts: (import("@prisma/client/runtime").GetResult<{
            id: number;
            createdAt: Date;
            updatedAt: Date;
            shiftName: string;
            typeOfShift: import(".prisma/client").typeOfShift;
            shiftTimeName: import(".prisma/client").shiftTimeClassification;
            shiftStartHour: Date;
            shiftEndHour: Date;
            userId: number;
            userPreference: string;
            scheduleId: number;
            shiftRoleId: number;
            userRef: import("@prisma/client/runtime").GetResult<{
                id: number;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                hash: string;
                userServerRole: import(".prisma/client").serverRole;
                userLevel: number;
                roleId: number;
                facilityId: number;
            }, unknown, never> & {};
        }, unknown, never> & {})[];
    }>;
    cnScheduleFU(userId: number, facilityId: number, dto: scheduleDto): Promise<{
        newSchedule: import("@prisma/client/runtime").GetResult<{
            id: number;
            createdAt: Date;
            updatedAt: Date;
            scheduleStart: Date;
            scheduleEnd: Date;
            scheduleDue: Date;
            userId: number;
            isLocked: boolean;
            facilityId: number;
        }, unknown, never> & {};
        scheduleShifts: import("../shift/dto").ShiftDto[];
    }>;
    editeFuterSceduleForUser(shiftsToEdit: bulkShiftsToEditDto): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        shiftName: string;
        typeOfShift: import(".prisma/client").typeOfShift;
        shiftTimeName: import(".prisma/client").shiftTimeClassification;
        shiftStartHour: Date;
        shiftEndHour: Date;
        userId: number;
        userPreference: string;
        userRef: import("@prisma/client/runtime").GetResult<{
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            hash: string;
            userServerRole: import(".prisma/client").serverRole;
            userLevel: number;
            roleId: number;
            facilityId: number;
        }, unknown, never> & {};
        scheduleId: number;
    }, unknown, never> & {})[]>;
    submittedUsers(facilityId: number): Promise<number[]>;
    createSchedule(scheduleDto: any, facilityId: number): Promise<{
        shifts: any[];
        stats: [any, any][];
    }>;
    setSystemSchedule(scheduleDto: any, facilityId: number): Promise<void>;
    deleteSchedule(facilityId: number): Promise<boolean>;
    getReplaceForShift(shiftId: string, schedule: string): Promise<void>;
    checkAdmnin(): void;
}
