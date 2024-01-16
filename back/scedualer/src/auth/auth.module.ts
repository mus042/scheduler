import { Module } from "@nestjs/common";
import { AuthControler } from "./auth.controler";
import { AuthService } from "./auth.service";
// import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";

@Module({
    imports:[JwtModule.register({})],
    controllers:[AuthControler],
    providers:[AuthService,JwtStrategy],
})

export class AuthModule {};
