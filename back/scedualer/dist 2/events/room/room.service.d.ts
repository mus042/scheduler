import { Room } from '../types/room.Interface';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class RoomService {
    private room;
    private prisma;
    constructor(room: Room, prisma: PrismaService);
}
