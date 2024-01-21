import { user } from '@prisma/client';

export interface Room {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  sender: user;
  destenation: user;
  shiftId: number;
}

/// user add request ,
//everytime user enter system - server websocket should conect.
// once conected should recive new requests
