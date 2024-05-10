import { user, typeOfShift, shiftTimeClassification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditShiftByDateDto, SystemShiftDTO, ShiftDto } from '../shift/dto';
import { scheduleDto } from './dto';
import { ShiftService } from '../shift/shift.services';
import { generateScheduleForDateDto } from './dto/GenerateScheduleForDate.Dto';
import { UserService } from '../user/user.service';
import { ScheduleUtil } from './schedule.utilsClass';
import { UserStatisticsService } from '../user-statistics/user-statistics.service';
import { shiftUserPosseblity } from './dto/shiftUserPosseblity.dto';
type scedualeDate = {
    day: {
        value: string;
        label: string;
    } | undefined;
    hours: number;
    minutes: number;
};
type shiftTemp = {
    id?: number;
    startHour: {
        hours: number;
        minutes: number;
    } | string;
    endHour: {
        hours: number;
        minutes: number;
    } | string;
    day?: {
        value: number;
        label: string;
    } | number | undefined;
    name: string;
    scheduleId?: number;
    roles?: [{
        name: string;
        quantity: number;
    }] | undefined;
};
type schedualSettings = {
    id?: number;
    name?: string | undefined;
    description?: string | undefined;
    facilityId: number;
    start: scedualeDate;
    end: scedualeDate;
    shiftsTemplate: shiftTemp[];
    daysPerSchedule: number | undefined;
    restDay: {
        start: scedualeDate;
        end: scedualeDate;
    };
};
type dayOptions = number | Date | {
    H: number;
    M: number;
    D: number;
} | string | undefined;
export declare class ScheduleService {
    private prisma;
    private shiftSercvice;
    private userService;
    private scheduleUtil;
    private shiftStats;
    constructor(prisma: PrismaService, shiftSercvice: ShiftService, userService: UserService, scheduleUtil: ScheduleUtil, shiftStats: UserStatisticsService);
    scheduleDue: number;
    getNextDayDate(day: dayOptions): any;
    isHourMinuteObject(value: any): value is {
        hours: number;
        minutes: number;
    };
    createScheduleTime(start: any, end: any): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        name: string;
        startDay: number;
        startHour: number;
        startMinutes: number;
        endMinutes: number;
        endDay: number;
        endHour: number;
    }, unknown, never> & {}>;
    deleteScheduleTime(schedTimeId: number): Promise<void>;
    setScheduleMold(schedSet: schedualSettings, facilityId: number): Promise<boolean>;
    getSelctedScheduleMold(facilityId: number): Promise<false | ({
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
    getNextScheduleForUser(userId: number, facilityId: number): Promise<{
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
        shifts: ShiftDto[];
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
            typeOfShift: typeOfShift;
            shiftTimeName: shiftTimeClassification;
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
    getNextSystemSchedule(facilityId: any): Promise<{
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
    getCurrentSchedule(facilityId: any): Promise<{
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
            typeOfShift: typeOfShift;
            shiftTimeName: shiftTimeClassification;
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
    createSchedualeForUser(scheduleDto: scheduleDto): Promise<{
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
        scheduleShifts: ShiftDto[];
    }>;
    generateEmptySchedulObject(startingDate: Date, schedualId: number): ShiftDto[];
    getScheduleIdByDateAnduserId(id: number, startDate: Date, scheduleType: string): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        scheduleStart: Date;
        scheduleEnd: Date;
        scheduleDue: Date;
        userId: number;
        isLocked: boolean;
        facilityId: number;
    }, unknown, never> & {}) | (import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        scheduleStart: Date;
        scheduleEnd: Date;
        scheduleDue: Date;
        isSelected: boolean;
        moldId: number;
        facilityId: number;
    }, unknown, never> & {})>;
    editeFuterSceduleForUser(scheduleId: number, shiftsToEdit: EditShiftByDateDto[]): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        shiftName: string;
        typeOfShift: typeOfShift;
        shiftTimeName: shiftTimeClassification;
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
    getSubmmitedUsersSchedule(facilityId: number): Promise<number[]>;
    getAllUsersForSchedule(startingDate: Date, selectedUsersIds: number[] | undefined, roleId: number | undefined, facilityId: any): Promise<Record<string, {
        userId: number;
        roleId: number;
        userPreference: string;
        userShiftId: number;
    }>[]>;
    getUsersForSchedule(users: user[], startingDate: Date): Promise<(import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        shiftName: string;
        typeOfShift: typeOfShift;
        shiftTimeName: shiftTimeClassification;
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
    }, unknown, never> & {})[][]>;
    getScheduleById(schedualId: number, scheduleType: string): Promise<{
        shifts: (import("@prisma/client/runtime").GetResult<{
            id: number;
            createdAt: Date;
            updatedAt: Date;
            shiftName: string;
            typeOfShift: typeOfShift;
            shiftTimeName: shiftTimeClassification;
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
    } & import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        scheduleStart: Date;
        scheduleEnd: Date;
        scheduleDue: Date;
        isSelected: boolean;
        moldId: number;
        facilityId: number;
    }, unknown, never> & {}>;
    findReplaceForShift(shiftId: number, scheduleIdToCheck: number): Promise<void>;
    convertShiftMoldToShift(shiftMold: any, schedualId: number | undefined, role?: any): Record<number, SystemShiftDTO>;
    genrateEmptySysSchedShifts(startDate: Date, scheduleId: number, shiftsMold: any[]): Record<number, Record<string, {
        shift: SystemShiftDTO;
        optinalUsers: shiftUserPosseblity[];
    }>>;
    createEmptySystemSchedule(startDate: Date, endDate: Date, facilitId: number, moldId: number): Promise<import("@prisma/client/runtime").GetResult<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        scheduleStart: Date;
        scheduleEnd: Date;
        scheduleDue: Date;
        isSelected: boolean;
        moldId: number;
        facilityId: number;
    }, unknown, never> & {}>;
    getAllShiftKeysForUser(userId: any, userData: any): any[];
    getAllUserShiftsInSchedule(userId: any, scheduleShifts: any): any;
    isShiftPossible(shiftToAssign: any, userId: number, scheduleShifts: any): boolean;
    assignScheduleShifts(scheduleAndShifts: any): {
        assigend: any[];
        unAssigend: any[];
        userShiftStats: Map<any, any>;
    };
    getDayShiftsFromSchedule(shift: any, assignedSchedule: any): any;
    adjustShiftHours(shiftToAdjust: any, newStartHour: Date, type: string, typeOfShift?: string): any;
    updateStats: (userStats: any, shiftToUpdate: any, amount: number) => void;
    updateAssignedSchedule(assignedSchedule: any, shiftsToUpdate: any, userShiftStats: any): any;
    createNoonCanceledShift(shift: any): any;
    changeDayIntoTwoShifts(shiftToAssign: any, assignedSchedule: any, usersShiftStats: any): boolean;
    findShiftWithLeastOptions(shiftOptionsMap: any): any;
    getNextShiftKeyInMap(currentShiftKey: any, shiftsMap: any): string;
    assignShift(shiftAndOptions: any, assignedShifts: any, shiftsMap: any, userShiftStats: any): any;
    updateShiftOptions(shiftToUpdate: any, option: any, action: 'remove' | 'add'): any;
    createSystemSchedule(dto: generateScheduleForDateDto): Promise<{
        shifts: any[];
        stats: [any, any][];
    }>;
    setSystemSchedule(dto: {
        [key: string]: any;
    }): Promise<void>;
    createScheduleShifts(scheduleShiftsToCreate: SystemShiftDTO[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    addUserOptionsToEmptySystemShifts(scheduleAndShifts: any, selectedUsers: number[]): Promise<any>;
    printSchedule(schedule: any, headline: any): void;
    deleteSystemSchedule(scheduleId: number): Promise<boolean>;
    deleteAllSystemSchedules(facilityId: any): Promise<boolean>;
}
export {};
