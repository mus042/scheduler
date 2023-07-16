import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import {Server, Socket} from "socket.io"
import { serverToClientEvents } from './types/events';
import { userRequest } from '@prisma/client';
import { Logger, OnModuleInit, UseGuards } from '@nestjs/common';
import { SocketAuthMiddleWare } from 'src/auth/websocket.mw';
import { JwtGuard } from '../auth/Guard';
import { WsJwtGuard } from 'src/auth/ws-jwt/ws-jwt.guard';
import { RequestDto } from 'src/user-request/dto/request.dto';


@WebSocketGateway({namespace: 'events'})
@UseGuards(WsJwtGuard)
export class EventsGateway implements OnModuleInit {
  private userSocketMap: { [userId: string]: Socket } = {};
  private logger = new Logger('event  gatway')
  @WebSocketServer()
  server:Server<any , serverToClientEvents> 
  onModuleInit(){
    this.server.on('connection',(Socket)=>{
      console.log("conected" , Socket.id);
      console.log('client',{Socket});
      if (Socket?.handshake) {
        const result = WsJwtGuard.validateToken(Socket);
        const userId = result?.sub;
        console.log("user id " , userId)
        if (userId) {
          this.userSocketMap[userId] = Socket;
          console.log('websocketmap:',this.userSocketMap);
        }
      }
    })
  }

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleWare() as any);
   
    this.logger.log('after init');
  }
  
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
   const destinationId = payload.destination;
    const destinationSocket = this.userSocketMap[destinationId];

    if (destinationSocket) {
      destinationSocket.emit('newRequest', payload);
    } else {
      console.log('Destination socket not found');
    }

    return payload;
  }
  
  sendRequest(request: RequestDto){
    const destinationId = request.destionationUserId;
    const destinationSocket = this.userSocketMap[destinationId];

    if(destinationSocket){
    //Case user is conected socket emit new request 
      destinationSocket.emit('newRequest',request );
      return true;
    // return 'Hello world!';
  }
  else {
    //user not conected, //send on concting ? 
    console.log('Destination socket not found');
    return false;
  }
}
}
