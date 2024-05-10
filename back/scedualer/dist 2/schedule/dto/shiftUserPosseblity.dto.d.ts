import { user } from '@prisma/client';
export declare class shiftUserPosseblity {
    scedualStart: Date;
    userId?: number;
    roleId: number;
    userPref: string;
    userRef?: user;
}
