import { Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request } from "express";
import { AuthDto, devAuthDto } from "./dto";
import { Roles } from "./roles/roles.decorator";
import { JwtGuard } from "./Guard";
import { RoleGuard } from "./role/role.guard";
@Controller('auth') 

export class AuthControler{
    
    
    constructor(private authService:AuthService){}
        @Post('signup')
        signup(@Body() dto:  AuthDto|devAuthDto){
            console.log({dto});
            
            if(dto.email !== null){
            return this.authService.signup(dto)
            }
            else{
                throw new ForbiddenException("email should not be empty")
            }
        }
        @HttpCode(HttpStatus.OK)
        @Post('signin')
        signin(@Body() dto:  AuthDto){
            return this.authService.signin(dto);
        };

        
        @UseGuards(JwtGuard,RoleGuard)
        @Roles('admin')
        @Post('addUserAsAdmin')
        addUser(@Body() user){
            if(user.email !== null){
                return this.authService.signup(user)
                }
                else{
                    throw new ForbiddenException("email should not be empty")
                } 
        }
} 