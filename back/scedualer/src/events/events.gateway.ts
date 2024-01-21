import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { serverToClientEvents } from './types/events';
import {
  PrismaClient,
  UserProfile,
  shift,
  user,
  userRequest,
} from '@prisma/client';
import { Injectable, Logger, OnModuleInit, UseGuards } from '@nestjs/common';

import { WsJwtGuard } from '../auth/ws-jwt/ws-jwt.guard';
import { RequestDto } from '../user-request/dto/request.dto';

@Injectable()
@WebSocketGateway({
  namespace: 'events',
  cors: 'http://localhost:19006/',
  credentials: true,
})
@UseGuards(WsJwtGuard)
export class EventsGateway implements OnModuleInit {
  private userSocketMap: { [userId: string]: Socket } = {};
  private logger = new Logger('event  gatway');
  constructor(private readonly prismaService: PrismaClient) {} // Constructor parameter declaration is enough

  @WebSocketServer()
  server: Server<any, serverToClientEvents>;
  onModuleInit() {
    this.server.on('connection', async (Socket) => {
      console.log('conected', Socket.id);
      console.log('client', { Socket });
      if (Socket?.handshake) {
        const result = WsJwtGuard.validateToken(Socket);
        const userId = result?.sub;
        console.log('user id ', userId);
        if (userId) {
          this.userSocketMap[userId] = Socket;
          console.log('websocketmap:', this.userSocketMap);
          //To Add load all the unsetRequest messages
          console.log('websocket pending');
          const allPendingReq: userRequest[] =
            await this.prismaService.userRequest.findMany({
              where: {
                destinationUserId: userId,
                status: 'pending',
              },
            });

          console.log({ allPendingReq });
          for (const req of allPendingReq) {
            //get user and shift details
            try {
              const user: UserProfile =
                await this.prismaService.userProfile.findUnique({
                  where: {
                    userId: req.senderId,
                  },
                });

              const shift: shift = await this.prismaService.shift.findUnique({
                where: {
                  id: req.shiftId,
                },
              });
              const request: RequestDto = {
                ...req,
                senderName: user.firstName,
                senderLastName: user.lastName,
                shiftStartTime: shift.shiftStartHour,
                shiftEndTime: shift.shiftEndHour,
              };
              this.sendRequest(request);
            } catch (error) {
              console.log({ error });
            }
          }
        }
      }
    });
  }

  afterInit(client: Socket) {
    this.logger.log('after init');
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    const destinationId = payload.destionationUserId;
    const destinationSocket = this.userSocketMap[destinationId];
    console.log('payload', { payload });
    if (destinationSocket) {
      destinationSocket.emit('newRequest', payload);
    } else {
      console.log('Destination socket not found');
      //store msg and emit it later
    }

    return payload;
  }

  sendRequest(request: RequestDto | userRequest) {
    const destinationId = request.destinationUserId;
    console.log('Send req destenationid : gateWay.101', { destinationId });
    const destinationSocket = this.userSocketMap[destinationId];
    console.log('sending msg');
    if (destinationSocket) {
      //Case user is conected socket emit new request
      destinationSocket.emit('newRequest', request);
      console.log('sent', request);
      return true;
      // return 'Hello world!';
    } else {
      //user not conected, //send on concting ?
      console.log('Destination socket not found');
      return false;
    }
  }
}
