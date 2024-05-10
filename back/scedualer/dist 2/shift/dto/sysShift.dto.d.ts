import { shiftTimeClassification, typeOfShift } from '@prisma/client';
export declare class SystemShiftDTO {
    id?: number;
    tmpId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    userId?: number;
    shiftName: string;
    shiftStartHour: Date;
    shiftEndHour: Date;
    typeOfShift?: typeOfShift;
    shiftTimeName?: shiftTimeClassification;
    shiftMoldId?: number;
    shiftRole: {
        id: number;
        name: string;
        description: string;
        facilityId: number;
        roleId?: number;
        role?: {
            name: string;
            id: number;
        };
    };
    scheduleId?: number;
    shiftType: "user" | "system";
    optinalUsers?: {
        userId: number;
        userPreference: string;
    };
}
