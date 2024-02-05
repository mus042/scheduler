import {
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { Request } from 'express';
import { GetUser } from '../Decorator';
import { JwtGuard } from '../auth/Guard';
import { user } from '@prisma/client';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { GetAllUsers } from '../Decorator/get.all.users.decorator';
import { EditUserAsAdminDto } from './dto/EditUserAdmin.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { RoleGuard } from '../auth/role/role.guard';
import { userDto } from './dto/user.dto';
import { AuthService } from 'src/auth/auth.service';

@UseGuards(JwtGuard, RoleGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Roles('admin', 'user')
  @Get('me')
  getMe(@GetUser() user: user) {
    return user;
  }

  @Roles('admin', 'user')
  @Patch('editUser')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @Roles('admin')
  @Post('editUserAsAdmin')
  editUserAsAdmin(@Body() dto) {
    console.log({ dto },);
    return this.userService.editUserAsAdmin(dto);
  }
  @Roles('admin')
  @Get('allUsers')
  getAllusers() {
    return this.userService.getAllUsers();
  }
}
