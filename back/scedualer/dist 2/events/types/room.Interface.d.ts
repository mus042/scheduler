import { user } from '@prisma/client';
export interface Room {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
    sender: user;
    destenation: user;
    shiftId: number;
}
