import { Socket } from 'socket.io';
import { JwtGuard } from './Guard';
import { JwtStrategy } from './strategy';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './ws-jwt/ws-jwt.guard';
import { WsException } from '@nestjs/websockets';

type socketMiddelWeare = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleWare = (): socketMiddelWeare => {
  return (client, next) => {
    console.log({ client });
    try {
      WsJwtGuard.validateToken(client);
      next();
    } catch (error) {
      console.log('error');
      // throw new WsException("error");
      return error;
    }
  };
};
