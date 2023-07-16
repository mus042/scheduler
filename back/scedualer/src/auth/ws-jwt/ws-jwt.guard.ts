import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { verify } from 'jsonwebtoken';

import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return false;
    }

    const client: Socket = context.switchToWs().getClient();

    // const { authorization } = client.handshake.headers;
    // console.log('line 20 ws jwt guard ', { authorization });
    try {
      const result = WsJwtGuard.validateToken(client);
      console.log({ result });
      return result;
    } catch (error) {
      throw new WsException('Token not valid');
      return false;
    }
  }

  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    const jwt: JwtService = new JwtService();
    // console.log('38', { authorization });

    const token: string = authorization.split(' ')[1];
    try {
      // console.log('line 39 ', { token });
      const payload = jwt.verify(token, { secret: 'secretKey' });
      // console.log('line 41  ', { payload });
      return payload;
    } catch (error) {
      console.log('error in validate Token ', { error });
      throw new WsException('error ');
    }
  }
}
