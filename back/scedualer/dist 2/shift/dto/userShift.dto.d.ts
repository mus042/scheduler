import { UserPreference, shiftTimeClassification, typeOfShift, user } from '@prisma/client';
export declare class ShiftDto {
    id?: number;
    createdAt?: Date;
    updatedAt?: Date;
    shiftName?: string;
    shiftStartHour: Date;
    shiftEndHour: Date;
    typeOfShift?: typeOfShift;
    shiftTimeName?: shiftTimeClassification;
    userId?: number | undefined;
    userRef?: user | null;
    userPreference: string;
    scheduleId?: number;
    shiftType: "user" | "system";
    userPref?: UserPreference;
}
