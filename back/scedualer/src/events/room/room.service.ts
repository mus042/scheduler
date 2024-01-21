import { Injectable } from '@nestjs/common';
import { Room } from '../types/room.Interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomService {
  constructor(private room: Room, private prisma: PrismaService) {}
}
