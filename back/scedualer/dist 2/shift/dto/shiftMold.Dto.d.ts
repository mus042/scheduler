import { UserPreference, user } from '@prisma/client';
export declare class shiftMoldDto {
    id?: number;
    name: String;
    startHour: string;
    endHour: string;
    day: number;
    userId?: number | undefined;
    userRef?: user | null;
    userPrefs: UserPreference;
    role?: string;
}
