import { ForbiddenException, Logger } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from "@nestjs/passport";
import { verify } from "jsonwebtoken";
import { Socket } from "socket.io";


export class JwtGuard extends AuthGuard('jwt'){

    constructor(){
        super();
    }

} 