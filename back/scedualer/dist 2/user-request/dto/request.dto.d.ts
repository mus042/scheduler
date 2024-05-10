import { requestStatus } from '@prisma/client';
export declare class RequestDto {
    id?: number;
    status?: requestStatus;
    senderId: number;
    senderName?: string;
    senderLastName?: string;
    destinationUserId: number;
    isAnswered: boolean;
    requsetMsg?: string;
    shiftId: number;
    shiftStartTime: Date;
    shiftEndTime: Date;
}
